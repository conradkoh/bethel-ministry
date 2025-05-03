import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Define the Team interface
export type Team = Doc<'teams'>;

// Define the TeamHierarchy interface (Team with children)
export interface TeamHierarchy extends Omit<Doc<'teams'>, '_creationTime'> {
  _creationTime?: number;
  children: TeamHierarchy[];
}

/**
 * Get all root teams (teams with no parent)
 */
export const getRootTeams = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get all root teams (teams with no parent)
    const rootTeams = await ctx.db
      .query('teams')
      .withIndex('by_parent')
      .filter((q) => q.eq(q.field('parentId'), null))
      .collect();

    return rootTeams;
  },
});

/**
 * Get a team by ID
 */
export const getTeamById = query({
  args: {
    id: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team
    const team = await ctx.db.get(args.id);
    return team;
  },
});

/**
 * Get all children of a team
 */
export const getTeamChildren = query({
  args: {
    parentId: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get all children of the team
    const childTeams = await ctx.db
      .query('teams')
      .withIndex('by_parent', (q) => q.eq('parentId', args.parentId))
      .collect();

    return childTeams;
  },
});

/**
 * Get the full hierarchy of a team
 */
export const getTeamHierarchy = query({
  args: {
    id: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team
    const team = await ctx.db.get(args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Helper function to build the hierarchy
    async function buildHierarchy(teamId: Id<'teams'>): Promise<TeamHierarchy> {
      const currentTeam = await ctx.db.get(teamId);
      if (!currentTeam) {
        throw new Error('Team not found');
      }

      // Get all children of the team
      const childTeams = await ctx.db
        .query('teams')
        .withIndex('by_parent', (q) => q.eq('parentId', teamId))
        .collect();

      // Build the hierarchy recursively
      const children: TeamHierarchy[] = [];
      for (const childTeam of childTeams) {
        children.push(await buildHierarchy(childTeam._id));
      }

      // Return the team with its children
      return {
        ...currentTeam,
        children,
      };
    }

    // Build and return the hierarchy
    return await buildHierarchy(args.id);
  },
});

/**
 * Get all teams owned by the current user
 */
export const getMyTeams = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get all teams owned by the user
    const myTeams = await ctx.db
      .query('teams')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();

    return myTeams;
  },
});

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
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

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
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

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
    const updates: Record<string, unknown> = {
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
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

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
