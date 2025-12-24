import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { getAuthUser } from '../../modules/auth/getAuthUser';
import type { Doc } from '../_generated/dataModel';
import { query } from '../_generated/server';

// Define the Participant interface
export type Participant = Doc<'participants'>;

/**
 * Get a participant by ID
 */
export const getParticipantById = query({
  args: {
    id: v.id('participants'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the participant
    const participant = await ctx.db.get('participants', args.id);
    if (!participant) {
      return null;
    }

    // Get the team to verify user has access
    const team = await ctx.db.get('teams', participant.teamId);
    if (!team) {
      return null;
    }

    // Verify the user is the owner of the team
    if (team.ownerId !== user._id) {
      return null;
    }

    return participant;
  },
});

/**
 * Get all participants in a team
 */
export const getTeamParticipants = query({
  args: {
    teamId: v.id('teams'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team to verify user has access
    const team = await ctx.db.get('teams', args.teamId);
    if (!team) {
      return [];
    }

    // Verify the user is the owner of the team
    if (team.ownerId !== user._id) {
      return [];
    }

    // Get all participants in the team
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_team', (q) => q.eq('teamId', args.teamId))
      .collect();

    return participants;
  },
});
