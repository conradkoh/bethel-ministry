import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../../modules/auth/getAuthUser';
import { mutation } from '../_generated/server';

/**
 * Create a new participant in a team
 */
export const createParticipant = mutation({
  args: {
    name: v.string(),
    teamId: v.id('teams'),
    joinDate: v.number(),
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

    // Verify the user is the owner of the team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Create the participant
    const now = Date.now();
    const participantId = await ctx.db.insert('participants', {
      name: args.name,
      teamId: args.teamId,
      joinDate: args.joinDate,
      createdAt: now,
      updatedAt: now,
    });

    return participantId;
  },
});

/**
 * Update an existing participant
 */
export const updateParticipant = mutation({
  args: {
    id: v.id('participants'),
    name: v.optional(v.string()),
    joinDate: v.optional(v.number()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the participant
    const participant = await ctx.db.get(args.id);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(participant.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the owner of the team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Update the participant
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.joinDate !== undefined) {
      updates.joinDate = args.joinDate;
    }

    await ctx.db.patch(args.id, updates);
    return true;
  },
});

/**
 * Delete a participant
 */
export const deleteParticipant = mutation({
  args: {
    id: v.id('participants'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the participant
    const participant = await ctx.db.get(args.id);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(participant.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user is the owner of the team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized');
    }

    // Delete the participant
    await ctx.db.delete(args.id);
    return true;
  },
});
