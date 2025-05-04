'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { useTeamParticipants } from '../../hooks/useParticipants';
import { CreateParticipantModal } from './modals/CreateParticipantModal';
import { DeleteParticipantModal } from './modals/DeleteParticipantModal';
import { EditParticipantModal } from './modals/EditParticipantModal';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface ParticipantListProps {
  teamId: Id<'teams'>;
}

export function ParticipantList({ teamId }: ParticipantListProps) {
  // Get participants data
  const participants = useTeamParticipants(teamId);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editParticipantId, setEditParticipantId] = useState<Id<'participants'> | null>(null);
  const [deleteParticipantId, setDeleteParticipantId] = useState<Id<'participants'> | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter participants based on search query
  const filteredParticipants = participants
    ? participants.filter((participant) =>
        participant.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle modal actions
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    setEditParticipantId(null);
  };

  const handleDeleteSuccess = () => {
    setDeleteParticipantId(null);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Loading state
  if (participants === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  // Empty state
  const isEmptyState = filteredParticipants.length === 0;

  // Action buttons for participants
  const renderActionButtons = (participantId: Id<'participants'>) => (
    <div className="flex justify-end">
      {/* Desktop actions */}
      <div className="hidden sm:flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditParticipantId(participantId)}
          title="Edit participant"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteParticipantId(participantId)}
          title="Delete participant"
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile actions */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditParticipantId(participantId)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteParticipantId(participantId)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search participants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Participant
        </Button>
      </div>

      {isEmptyState ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No participants found.' : 'No participants yet.'}
          </p>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="mt-4">
            Add your first participant
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>{formatDate(participant.joinDate)}</TableCell>
                  <TableCell className="text-right">
                    {renderActionButtons(participant._id)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateParticipantModal
          teamId={teamId}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editParticipantId !== null && (
        <EditParticipantModal
          participantId={editParticipantId}
          isOpen={true}
          onClose={() => setEditParticipantId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deleteParticipantId !== null && (
        <DeleteParticipantModal
          participantId={deleteParticipantId}
          isOpen={true}
          onClose={() => setDeleteParticipantId(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
