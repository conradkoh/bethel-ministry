'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Edit, Trash2 } from 'lucide-react';
import type { Participant } from '../../lib/types/participant';

interface ParticipantCardProps {
  participant: Participant;
  onEdit?: (participantId: Id<'participants'>) => void;
  onDelete?: (participantId: Id<'participants'>) => void;
}

export function ParticipantCard({ participant, onEdit, onDelete }: ParticipantCardProps) {
  // Format join date
  const joinDate = new Date(participant.joinDate).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{participant.name}</CardTitle>
        <CardDescription>Joined {joinDate}</CardDescription>
      </CardHeader>
      <CardContent>{/* Add more participant details here if needed */}</CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onEdit && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(participant._id)}
            title="Edit participant"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(participant._id)}
            title="Delete participant"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
