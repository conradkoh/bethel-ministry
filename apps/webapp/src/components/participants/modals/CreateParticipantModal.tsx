'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ParticipantForm } from '../ParticipantForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateParticipantModalProps {
  teamId: Id<'teams'>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (participantId: Id<'participants'>) => void;
}

export function CreateParticipantModal({
  teamId,
  isOpen,
  onClose,
  onSuccess,
}: CreateParticipantModalProps) {
  // Form success handler
  const handleSuccess = (participantId: Id<'participants'>) => {
    onSuccess?.(participantId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>Add a new participant to the team.</DialogDescription>
        </DialogHeader>
        <ParticipantForm teamId={teamId} onSuccess={handleSuccess} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
