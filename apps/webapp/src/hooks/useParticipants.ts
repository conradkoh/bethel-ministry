import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { useCallback } from 'react';
import type { ParticipantFormData } from '../lib/types/participant';

/**
 * Hook to get a single participant by ID
 */
export function useParticipant(id: Id<'participants'>) {
  const participant = useSessionQuery(api.participants.queries.getParticipantById, { id });
  return participant;
}

/**
 * Hook to get all participants in a team
 */
export function useTeamParticipants(teamId: Id<'teams'>) {
  // Always call the hook to avoid Rules of Hooks violations,
  // but protect against invalid IDs in the component logic
  const participants = useSessionQuery(api.participants.queries.getTeamParticipants, { teamId });

  if (!teamId || teamId === ('' as Id<'teams'>)) {
    return [];
  }

  return participants ?? [];
}

/**
 * Hook for creating participants
 */
export function useCreateParticipant() {
  const createParticipant = useSessionMutation(api.participants.mutations.createParticipant);

  const create = useCallback(
    async (data: ParticipantFormData) => {
      try {
        const participantId = await createParticipant({
          name: data.name,
          teamId: data.teamId,
          joinDate: data.joinDate,
        });
        return { success: true, participantId };
      } catch (error) {
        console.error('Error creating participant:', error);
        return { success: false, error: (error as Error).message };
      }
    },
    [createParticipant]
  );

  return { createParticipant: create };
}

/**
 * Hook for updating participants
 */
export function useUpdateParticipant() {
  const updateParticipant = useSessionMutation(api.participants.mutations.updateParticipant);

  const update = useCallback(
    async (id: Id<'participants'>, data: Partial<ParticipantFormData>) => {
      try {
        const success = await updateParticipant({
          id,
          name: data.name,
          joinDate: data.joinDate,
        });
        return { success };
      } catch (error) {
        console.error('Error updating participant:', error);
        return { success: false, error: (error as Error).message };
      }
    },
    [updateParticipant]
  );

  return { updateParticipant: update };
}

/**
 * Hook for deleting participants
 */
export function useDeleteParticipant() {
  const deleteParticipant = useSessionMutation(api.participants.mutations.deleteParticipant);

  const remove = useCallback(
    async (id: Id<'participants'>) => {
      try {
        const success = await deleteParticipant({ id });
        return { success };
      } catch (error) {
        console.error('Error deleting participant:', error);
        return { success: false, error: (error as Error).message };
      }
    },
    [deleteParticipant]
  );

  return { deleteParticipant: remove };
}
