import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { TeamHierarchy } from '@workspace/backend/convex/teams';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { Team } from '../lib/types/team';

/**
 * Hook to get all teams owned by the current user
 */
export const useMyTeams = () => {
  const teams = useSessionQuery(api.teams.getMyTeams);

  return {
    teams,
    isLoading: teams === undefined,
    error: teams === null ? 'Failed to load teams' : null,
  };
};

/**
 * Hook to get all root teams (teams with no parent)
 */
export const useRootTeams = () => {
  const teams = useSessionQuery(api.teams.getRootTeams);

  return {
    teams,
    isLoading: teams === undefined,
    error: teams === null ? 'Failed to load root teams' : null,
  };
};

/**
 * Hook to get a team with its full hierarchy of children
 */
export const useTeamHierarchy = (teamId: Id<'teams'> | null) => {
  const teamHierarchy = useSessionQuery(
    api.teams.getTeamHierarchy,
    teamId ? { id: teamId } : 'skip'
  );

  return {
    teamHierarchy,
    isLoading: teamId && teamHierarchy === undefined,
    error: teamHierarchy === null ? 'Failed to load team hierarchy' : null,
  };
};

/**
 * Hook to get a team by ID
 */
export const useTeam = (teamId: Id<'teams'> | null) => {
  const team = useSessionQuery(api.teams.getTeamById, teamId ? { id: teamId } : 'skip');

  return {
    team,
    isLoading: teamId && team === undefined,
    error: team === null ? 'Failed to load team' : null,
  };
};

/**
 * Hook to get all children of a team
 */
export const useTeamChildren = (parentId: Id<'teams'> | null) => {
  const children = useSessionQuery(api.teams.getTeamChildren, parentId ? { parentId } : 'skip');

  return {
    children,
    isLoading: parentId && children === undefined,
    error: children === null ? 'Failed to load team children' : null,
  };
};

/**
 * Hook for team creation
 */
export const useCreateTeam = () => {
  const createTeam = useSessionMutation(api.teams.createTeam);

  return {
    createTeam: async (name: string, timezone: string, parentId?: Id<'teams'>) => {
      try {
        const teamId = await createTeam({ name, timezone, parentId });
        return { success: true, teamId };
      } catch (error) {
        console.error('Failed to create team:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * Hook for team update
 */
export const useUpdateTeam = () => {
  const updateTeam = useSessionMutation(api.teams.updateTeam);

  return {
    updateTeam: async (id: Id<'teams'>, data: { name?: string; timezone?: string }) => {
      try {
        const success = await updateTeam({ id, ...data });
        return { success };
      } catch (error) {
        console.error('Failed to update team:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * Hook for team deletion
 */
export const useDeleteTeam = () => {
  const deleteTeam = useSessionMutation(api.teams.deleteTeam);

  return {
    deleteTeam: async (id: Id<'teams'>) => {
      try {
        const success = await deleteTeam({ id });
        return { success };
      } catch (error) {
        console.error('Failed to delete team:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * Hook to get all descendants of a team (children, grandchildren, etc.)
 */
export const useTeamDescendants = (teamId: Id<'teams'> | null) => {
  const descendants = useSessionQuery(
    api.teams.getTeamDescendants,
    teamId ? { id: teamId } : 'skip'
  );

  return {
    descendants,
    isLoading: teamId && descendants === undefined,
    error: descendants === null ? 'Failed to load team descendants' : null,
  };
};
