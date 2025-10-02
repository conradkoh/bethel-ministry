'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { useDeleteParticipant, useParticipant } from '../../../hooks/useParticipants';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface DeleteParticipantModalProps {
  participantId: Id<'participants'> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteParticipantModal({
  participantId,
  isOpen,
  onClose,
  onSuccess,
}: DeleteParticipantModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get participant data
  const participant = participantId ? useParticipant(participantId) : null;
  const { deleteParticipant } = useDeleteParticipant();

  // Handle delete
  const handleDelete = async () => {
    if (!participantId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteParticipant(participantId);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || 'Failed to delete participant');
      }
    } catch (err) {
      console.error('Error deleting participant:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Participant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {participant?.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-sm font-medium text-destructive">{error}</div>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
