'use client';

import { useAuthState } from '@/modules/auth/AuthProvider';
import { useSessionId } from 'convex-helpers/react/sessions';
import { useShareToken } from './useShareToken';

/**
 * Hook to get the current session information
 * This includes the session ID and authentication state
 * It also includes share token information if available
 */
export function useSession() {
  const sessionId = useSessionId();
  const authState = useAuthState();
  const { shareToken, shareTeamId, sharePermissions, hasPermission, isForTeam } = useShareToken();

  const isAuthenticated = authState?.state === 'authenticated';
  const user = isAuthenticated ? authState.user : null;

  return {
    sessionId,
    isAuthenticated,
    user,
    shareToken,
    shareTeamId,
    sharePermissions,
    hasPermission,
    isForTeam,
  };
}
