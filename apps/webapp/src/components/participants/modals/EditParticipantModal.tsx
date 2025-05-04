'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect } from 'react';
import { useParticipant } from '../../../hooks/useParticipants';
import type { ParticipantFormData } from '../../../lib/types/participant';
import { ParticipantForm } from '../ParticipantForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditParticipantModalProps {
  participantId: Id<'participants'> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (participantId: Id<'participants'>) => void;
}

export function EditParticipantModal({
  participantId,
  isOpen,
  onClose,
  onSuccess,
}: EditParticipantModalProps) {
  // Get participant data
  const participant = participantId ? useParticipant(participantId) : null;

  // Form success handler
  const handleSuccess = (participantId: Id<'participants'>) => {
    onSuccess?.(participantId);
    onClose();
  };

  // Initial form data
  const initialData: Partial<ParticipantFormData> | undefined = participant
    ? {
        name: participant.name,
        joinDate: participant.joinDate,
        teamId: participant.teamId,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>Update participant details.</DialogDescription>
        </DialogHeader>
        {participant && participantId && (
          <ParticipantForm
            teamId={participant.teamId}
            initialData={initialData}
            participantId={participantId}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
