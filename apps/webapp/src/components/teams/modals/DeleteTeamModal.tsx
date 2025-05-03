'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { useDeleteTeam, useTeam, useTeamDescendants } from '../../../hooks/useTeams';

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
import { Loader2 } from 'lucide-react';

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
  const { descendants, isLoading: isLoadingDescendants } = useTeamDescendants(teamId);
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

  // Calculate how many child teams will be deleted
  const childTeamsCount = descendants?.length || 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this team?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {team ? (
              <>
                <div>
                  This will permanently delete the team "<strong>{team.name}</strong>".
                </div>

                {isLoadingDescendants ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking for child teams...</span>
                  </div>
                ) : childTeamsCount > 0 ? (
                  <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-700">
                    <div className="font-medium">Warning: Child teams will be deleted</div>
                    <div className="mt-1">
                      This team has {childTeamsCount} child{' '}
                      {childTeamsCount === 1 ? 'team' : 'teams'} that will also be deleted.
                    </div>
                  </div>
                ) : null}

                <div className="pt-2">This action cannot be undone.</div>
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
