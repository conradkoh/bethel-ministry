import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import type { ShareLink, ShareLinkFormData } from '../lib/types/shareLink';

/**
 * Hook to fetch all share links for a team
 */
export function useTeamShareLinks(teamId: Id<'teams'>) {
  const shareLinks = useSessionQuery(api.shareLinks.getTeamShareLinks, {
    teamId,
  });

  return {
    shareLinks,
    isLoading: shareLinks === undefined,
  };
}

/**
 * Hook to create a new share link
 */
export function useCreateShareLink() {
  const createShareLinkMutation = useSessionMutation(api.shareLinks.createShareLink);

  const createShareLink = async (
    teamId: Id<'teams'>,
    data: ShareLinkFormData
  ): Promise<Id<'shareLinks'>> => {
    return createShareLinkMutation({
      name: data.name,
      teamId,
      permissions: data.permissions,
      expiresAt: data.expiresAt || undefined,
    });
  };

  return { createShareLink };
}

/**
 * Hook to update an existing share link
 */
export function useUpdateShareLink() {
  const updateShareLinkMutation = useSessionMutation(api.shareLinks.updateShareLink);

  const updateShareLink = async (
    shareLinkId: Id<'shareLinks'>,
    data: ShareLinkFormData
  ): Promise<Id<'shareLinks'>> => {
    return updateShareLinkMutation({
      shareLinkId,
      name: data.name,
      permissions: data.permissions,
      expiresAt: data.expiresAt || undefined,
    });
  };

  return { updateShareLink };
}

/**
 * Hook to delete a share link
 */
export function useDeleteShareLink() {
  const deleteShareLinkMutation = useSessionMutation(api.shareLinks.deleteShareLink);

  const deleteShareLink = async (shareLinkId: Id<'shareLinks'>): Promise<{ success: boolean }> => {
    return deleteShareLinkMutation({
      shareLinkId,
    });
  };

  return { deleteShareLink };
}

/**
 * Hook to validate a share link token
 */
export function useValidateShareLink(token: string) {
  const validationResult = useSessionQuery(api.shareLinks.validateShareLink, {
    token,
  });

  return {
    validationResult,
    isLoading: validationResult === undefined,
  };
}
