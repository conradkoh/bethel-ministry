import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

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
    await getAuthUser(ctx, args);

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
    await getAuthUser(ctx, args);

    // Get the team
    const team = await ctx.db.get('teams', args.id);
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
    await getAuthUser(ctx, args);

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
    await getAuthUser(ctx, args);

    // Get the team
    const team = await ctx.db.get('teams', args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Helper function to build the hierarchy
    async function buildHierarchy(teamId: Id<'teams'>): Promise<TeamHierarchy> {
      const currentTeam = await ctx.db.get('teams', teamId);
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

    // Initialize path as an empty string (will be built based on parent and self)
    let path = '/';

    // If parentId is provided, verify it exists and get its path
    if (args.parentId) {
      const parentTeam = await ctx.db.get('teams', args.parentId);
      if (!parentTeam) {
        throw new Error('Parent team not found');
      }

      // Inherit the parent's path
      path = parentTeam.path;
    }

    // Create the team
    const now = Date.now();
    const teamId = await ctx.db.insert('teams', {
      name: args.name,
      timezone: args.timezone,
      ownerId: user._id,
      parentId: args.parentId,
      path, // Initial path (will update after creation to include own ID)
      createdAt: now,
      updatedAt: now,
    });

    // Update the path to include the team's own ID
    // Format: /parent_id/team_id/ or /team_id/ for root teams
    const updatedPath = `${path}${teamId}/`;
    await ctx.db.patch('teams', teamId, {
      path: updatedPath,
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
    const team = await ctx.db.get('teams', args.id);
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

    await ctx.db.patch('teams', args.id, updates);
    return true;
  },
});

/**
 * Delete a team with the given ID.
 * Only the owner of the team can delete it.
 * This will also delete all descendant teams.
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
    const team = await ctx.db.get('teams', args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the owner
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Get the path of the team to delete
    const teamPath = team.path;

    // Get all descendants using the path
    const descendants = await ctx.db
      .query('teams')
      .withIndex('by_path', (q) => q.gte('path', teamPath))
      .filter((q) =>
        q.and(
          q.lt(q.field('path'), `${teamPath}\uffff`), // Upper bound for prefix search
          q.neq(q.field('_id'), args.id) // Exclude the team itself
        )
      )
      .collect();

    // Delete all descendants first (bottom-up is safest to maintain referential integrity)
    for (const descendant of descendants) {
      await ctx.db.delete('teams', descendant._id);
    }

    // Finally, delete the team itself
    await ctx.db.delete('teams', args.id);
    return true;
  },
});

/**
 * Get all descendants of a team using the path field
 * This uses the path field for efficient querying
 */
export const getTeamDescendants = query({
  args: {
    id: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    await getAuthUser(ctx, args);

    // Get the team
    const team = await ctx.db.get('teams', args.id);
    if (!team) {
      throw new Error('Team not found');
    }

    // The path of the team
    const teamPath = team.path;

    // Get all teams whose path starts with this team's path
    // but exclude the team itself
    const descendants = await ctx.db
      .query('teams')
      .withIndex('by_path', (q) => q.gte('path', teamPath))
      .filter((q) =>
        q.and(
          q.lt(q.field('path'), `${teamPath}\uffff`), // Upper bound for prefix search
          q.neq(q.field('_id'), args.id) // Exclude the team itself
        )
      )
      .collect();

    return descendants;
  },
});

/**
 * List all teams owned by the current user
 */
export const listOwnedTeams = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const user = await getAuthUser(ctx, args);

    // Query teams owned by the user
    const teams = await ctx.db
      .query('teams')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();

    return teams;
  },
});
