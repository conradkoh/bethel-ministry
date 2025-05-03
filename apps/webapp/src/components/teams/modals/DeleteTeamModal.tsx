'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { useDeleteTeam, useTeam } from '../../../hooks/useTeams';

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
import { Button } from '@/components/ui/button';

interface DeleteTeamModalProps {
  teamId: Id<'teams'> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteTeamModal({ teamId, isOpen, onClose, onSuccess }: DeleteTeamModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get team data and delete function
  const { team } = useTeam(teamId);
  const { deleteTeam } = useDeleteTeam();

  // Handle team deletion
  const handleDelete = async () => {
    if (!teamId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteTeam(teamId);

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || 'Failed to delete team');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this team?</AlertDialogTitle>
          <AlertDialogDescription>
            {team ? (
              <>
                This will permanently delete the team "<strong>{team.name}</strong>"
                {team.parentId ? '' : ' and all its child teams'}. This action cannot be undone.
              </>
            ) : (
              'This will permanently delete the team and cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
