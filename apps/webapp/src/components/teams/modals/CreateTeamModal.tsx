'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { TeamForm } from '../TeamForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (teamId: Id<'teams'>) => void;
  parentId?: Id<'teams'> | null;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess, parentId }: CreateTeamModalProps) {
  // Form success handler
  const handleSuccess = (teamId: Id<'teams'>) => {
    onSuccess?.(teamId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{parentId ? 'Create Child Team' : 'Create Team'}</DialogTitle>
          <DialogDescription>
            {parentId
              ? 'Create a new child team under the selected parent team.'
              : 'Create a new root team.'}
          </DialogDescription>
        </DialogHeader>
        <TeamForm parentId={parentId} onSuccess={handleSuccess} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
