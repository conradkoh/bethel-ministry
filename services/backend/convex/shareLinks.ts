import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
// @ts-ignore - nanoid is installed but TypeScript can't find the types
import { customAlphabet } from 'nanoid';
import { getAuthUser } from '../modules/auth/getAuthUser';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { TeamPermission, type TeamPermissionType } from './schema';

// Define the ShareLink interface
export type ShareLink = Doc<'shareLinks'>;

// Generate a secure random token for share links
// Using a custom alphabet that's URL-safe and avoids ambiguous characters
const generateToken = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz',
  16
);

/**
 * Create a new share link for a team
 */
export const createShareLink = mutation({
  args: {
    name: v.string(),
    teamId: v.id('teams'),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team to verify it exists and user has access
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the team owner
    if (team.ownerId !== user._id) {
      throw new Error('Only team owners can create share links');
    }

    // Validate permissions
    for (const permission of args.permissions) {
      if (!Object.values(TeamPermission).includes(permission as TeamPermissionType)) {
        throw new Error(`Invalid permission: ${permission}`);
      }
    }

    // Generate a unique token
    const token = generateToken();

    // Create the share link
    const now = Date.now();
    const shareLinkId = await ctx.db.insert('shareLinks', {
      name: args.name,
      teamId: args.teamId,
      createdBy: user._id,
      permissions: args.permissions,
      token,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    return shareLinkId;
  },
});

/**
 * Get all share links for a team
 */
export const getTeamShareLinks = query({
  args: {
    teamId: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team to verify it exists and user has access
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the team owner
    if (team.ownerId !== user._id) {
      throw new Error('Only team owners can view share links');
    }

    // Get all share links for the team
    const shareLinks = await ctx.db
      .query('shareLinks')
      .withIndex('by_team', (q) => q.eq('teamId', args.teamId))
      .collect();

    return shareLinks;
  },
});

/**
 * Update an existing share link
 */
export const updateShareLink = mutation({
  args: {
    shareLinkId: v.id('shareLinks'),
    name: v.string(),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the share link
    const shareLink = await ctx.db.get(args.shareLinkId);
    if (!shareLink) {
      throw new Error('Share link not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(shareLink.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the team owner
    if (team.ownerId !== user._id) {
      throw new Error('Only team owners can update share links');
    }

    // Validate permissions
    for (const permission of args.permissions) {
      if (!Object.values(TeamPermission).includes(permission as TeamPermissionType)) {
        throw new Error(`Invalid permission: ${permission}`);
      }
    }

    // Update the share link
    await ctx.db.patch(args.shareLinkId, {
      name: args.name,
      permissions: args.permissions,
      expiresAt: args.expiresAt,
      updatedAt: Date.now(),
    });

    return args.shareLinkId;
  },
});

/**
 * Delete a share link
 */
export const deleteShareLink = mutation({
  args: {
    shareLinkId: v.id('shareLinks'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the share link
    const shareLink = await ctx.db.get(args.shareLinkId);
    if (!shareLink) {
      throw new Error('Share link not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(shareLink.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the team owner
    if (team.ownerId !== user._id) {
      throw new Error('Only team owners can delete share links');
    }

    // Delete the share link
    await ctx.db.delete(args.shareLinkId);

    return { success: true };
  },
});

/**
 * Validate a share link token and return the associated team and permissions
 */
export const validateShareLink = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the share link by token
    const shareLinks = await ctx.db
      .query('shareLinks')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .collect();

    if (shareLinks.length === 0) {
      return { valid: false, message: 'Invalid share link' };
    }

    const shareLink = shareLinks[0];

    // Check if the share link has expired
    if (shareLink.expiresAt && shareLink.expiresAt < Date.now()) {
      return { valid: false, message: 'Share link has expired' };
    }

    // Get the team
    const team = await ctx.db.get(shareLink.teamId);
    if (!team) {
      return { valid: false, message: 'Team not found' };
    }

    // Return the team and permissions
    return {
      valid: true,
      teamId: team._id,
      teamName: team.name,
      permissions: shareLink.permissions,
    };
  },
});
