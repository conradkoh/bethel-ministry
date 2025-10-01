'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useDeleteShareLink, useTeamShareLinks } from '../../../hooks/useShareLinks';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InfoIcon } from 'lucide-react';

interface DeleteShareLinkModalProps {
  shareLinkId: Id<'shareLinks'> | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteShareLinkModal({ shareLinkId, isOpen, onClose }: DeleteShareLinkModalProps) {
  const { deleteShareLink } = useDeleteShareLink();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all share links to find the one we're deleting (for display purposes)
  const [teamId, setTeamId] = useState<Id<'teams'> | null>(null);
  const { shareLinks } = useTeamShareLinks(teamId as Id<'teams'>);
  const shareLink = shareLinkId ? shareLinks?.find((link) => link._id === shareLinkId) : null;

  // Update teamId when we find the share link
  useEffect(() => {
    if (shareLinks && shareLinkId) {
      const link = shareLinks.find((link) => link._id === shareLinkId);
      if (link) {
        setTeamId(link.teamId);
      }
    }
  }, [shareLinks, shareLinkId]);

  const handleDelete = async () => {
    if (!shareLinkId) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteShareLink(shareLinkId);
      onClose();
    } catch (err) {
      console.error('Failed to delete share link:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete share link');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Share Link</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the share link "{shareLink?.name}"? This action cannot
            be undone. Anyone using this link will no longer have access to your team.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="text-sm text-destructive flex items-center gap-1">
            <InfoIcon className="h-4 w-4" />
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
