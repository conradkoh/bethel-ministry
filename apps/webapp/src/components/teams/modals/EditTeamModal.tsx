'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect } from 'react';
import { useTeam } from '../../../hooks/useTeams';
import type { TeamFormData } from '../../../lib/types/team';
import { TeamForm } from '../TeamForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditTeamModalProps {
  teamId: Id<'teams'> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (teamId: Id<'teams'>) => void;
}

export function EditTeamModal({ teamId, isOpen, onClose, onSuccess }: EditTeamModalProps) {
  // Get team data
  const { team, isLoading, error } = useTeam(teamId);

  // Initialize form data from team
  const initialData: Partial<TeamFormData> = {
    name: team?.name || '',
    timezone: team?.timezone || '',
  };

  // Form success handler
  const handleSuccess = (updatedTeamId: Id<'teams'>) => {
    onSuccess?.(updatedTeamId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>Update the team information.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <p>Loading team information...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">Error loading team data. Please try again.</div>
        ) : (
          <TeamForm
            teamId={teamId || undefined}
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
