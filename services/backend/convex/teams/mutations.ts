import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';

/**
 * Create a new team with the given name and timezone.
 * If parentId is provided, the team will be a child of the parent team.
 * Otherwise, it will be a root team.
 */
export const createTeam = mutation({
  args: {
    name: v.string(),
    timezone: v.string(),
    parentId: v.optional(v.id('teams')),
  },
  handler: async (ctx, args) => {
    // Get the current user's ID
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier;

    // Get user document
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', userId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // If parentId is provided, verify it exists
    if (args.parentId) {
      const parentTeam = await ctx.db.get(args.parentId);
      if (!parentTeam) {
        throw new Error('Parent team not found');
      }
    }

    // Create the team
    const now = Date.now();
    const teamId = await ctx.db.insert('teams', {
      name: args.name,
      timezone: args.timezone,
      ownerId: user._id,
      parentId: args.parentId,
      createdAt: now,
      updatedAt: now,
    });

    return teamId;
  },
});

/**
 * Update an existing team with the given ID.
 * Only the owner of the team can update it.
 */
export const updateTeam = mutation({
  args: {
    id: v.id('teams'),
    name: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user's ID
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier;

    // Get user document
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', userId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the team
    const team = await ctx.db.get(args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the owner
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Update the team
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.timezone !== undefined) {
      updates.timezone = args.timezone;
    }

    await ctx.db.patch(args.id, updates);
    return true;
  },
});

/**
 * Delete a team with the given ID.
 * Only the owner of the team can delete it.
 * This will also delete all child teams.
 */
export const deleteTeam = mutation({
  args: {
    id: v.id('teams'),
  },
  handler: async (ctx, args) => {
    // Get the current user's ID
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier;

    // Get user document
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', userId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the team
    const team = await ctx.db.get(args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the owner
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Get all child teams - we need to delete them first
    const childTeams = await ctx.db
      .query('teams')
      .withIndex('by_parent', (q) => q.eq('parentId', args.id))
      .collect();

    // Recursively delete child teams
    for (const childTeam of childTeams) {
      // Delete each child team
      await ctx.db.delete(childTeam._id);
    }

    // Delete the team
    await ctx.db.delete(args.id);
    return true;
  },
});
