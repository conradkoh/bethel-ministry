'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useSession } from './useSession';

interface ShareTokenData {
  token: string;
  teamId: Id<'teams'>;
  permissions: string[];
}

/**
 * Hook to get and manage the share token from session storage
 */
export function useShareToken() {
  const [shareData, setShareData] = useState<ShareTokenData | null>(null);
  const { sessionId } = useSession();

  // Load share token data from session storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('shareToken');
    const teamId = sessionStorage.getItem('shareTeamId');
    const permissionsStr = sessionStorage.getItem('sharePermissions');

    if (token && teamId && permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr);
        setShareData({
          token,
          teamId: teamId as Id<'teams'>,
          permissions,
        });
      } catch (error) {
        console.error('Failed to parse share permissions:', error);
        clearShareToken();
      }
    }
    // sessionId is not used in the effect body, so it's not needed as a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear share token data from session storage
  const clearShareToken = () => {
    sessionStorage.removeItem('shareToken');
    sessionStorage.removeItem('shareTeamId');
    sessionStorage.removeItem('sharePermissions');
    setShareData(null);
  };

  // Check if the user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!shareData) return false;
    return shareData.permissions.includes(permission);
  };

  // Check if the share token is for a specific team
  const isForTeam = (teamId: Id<'teams'>): boolean => {
    if (!shareData) return false;
    return shareData.teamId === teamId;
  };

  return {
    shareToken: shareData?.token,
    shareTeamId: shareData?.teamId,
    sharePermissions: shareData?.permissions,
    hasPermission,
    isForTeam,
    clearShareToken,
  };
}
