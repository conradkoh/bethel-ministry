import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { query } from '../_generated/server';

// Define the Team interface
export type Team = Doc<'teams'>;

// Define the TeamHierarchy interface (Team with children)
export interface TeamHierarchy extends Team {
  children: TeamHierarchy[];
}

/**
 * Get all root teams (teams with no parent)
 */
export const getRootTeams = query({
  handler: async (ctx) => {
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
    return team;
  },
});

/**
 * Get all children of a team
 */
export const getTeamChildren = query({
  args: {
    parentId: v.id('teams'),
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
  handler: async (ctx) => {
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

    // Get all teams owned by the user
    const myTeams = await ctx.db
      .query('teams')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();

    return myTeams;
  },
});
