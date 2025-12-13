'use client';

import { TeamCard } from '@/components/teams/TeamCard';
import { TeamTree } from '@/components/teams/TeamTree';
import { DeleteTeamModal } from '@/components/teams/modals/DeleteTeamModal';
import { EditTeamModal } from '@/components/teams/modals/EditTeamModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamParticipants } from '@/hooks/useParticipants';
import { useTeam, useTeamChildren } from '@/hooks/useTeams';
import type { Team } from '@/lib/types/team';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft, MoreHorizontal, Pencil, Trash, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [teamId, setTeamId] = useState<Id<'teams'> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [childTeamToEdit, setChildTeamToEdit] = useState<Id<'teams'> | null>(null);
  const [childTeamToDelete, setChildTeamToDelete] = useState<Id<'teams'> | null>(null);

  useEffect(() => {
    if (params.teamId) {
      setTeamId(params.teamId as Id<'teams'>);
    }
  }, [params]);

  // Redirect to participants page if hash is #participants
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#participants') {
      router.push(`/app/teams/${params.teamId}/participants`);
    }
  }, [params.teamId, router]);

  // Get team data
  const { team, isLoading, error } = useTeam(teamId);
  const { children: childTeams } = useTeamChildren(teamId);
  const participants = useTeamParticipants(teamId || ('' as Id<'teams'>));
  const participantsCount = participants.length;

  // Modal handlers
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const openChildEditModal = (childId: Id<'teams'>) => setChildTeamToEdit(childId);
  const closeChildEditModal = () => setChildTeamToEdit(null);

  const openChildDeleteModal = (childId: Id<'teams'>) => setChildTeamToDelete(childId);
  const closeChildDeleteModal = () => setChildTeamToDelete(null);

  // Handle successful team deletion
  const handleDeleteSuccess = () => {
    closeDeleteModal();
    router.push('/app/teams');
  };

  // Render loading state
  if (isLoading || !teamId) {
    return (
      <div className="container p-6">
        <div className="mb-6">
          <Link href="/app/teams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">Loading team information...</div>
      </div>
    );
  }

  // Render error state
  if (error || !team) {
    return (
      <div className="container p-6">
        <div className="mb-6">
          <Link href="/app/teams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
        </div>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load team information. The team may not exist or you don't have permission to
          view it.
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="mb-6">
        <Link href="/app/teams">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openEditModal}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openDeleteModal} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Team Information</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Team Name</div>
                <p className="mt-1">{team.name}</p>
              </div>
              {team.parentId && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Parent Team</div>
                  <p className="mt-1">Has Parent Team</p>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-500">Created</div>
                <p className="mt-1">
                  {new Date(team._creationTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Team Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Members</div>
                <p className="mt-1 text-2xl font-bold">{participantsCount}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Child Teams</div>
                <p className="mt-1 text-2xl font-bold">{childTeams?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Structure Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Team Structure</h2>

        {/* Child Teams */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Child Teams</h3>
            <Link href={`/app/teams/create?parentId=${team._id}`}>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Add Child Team
              </Button>
            </Link>
          </div>

          {childTeams && childTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childTeams.map((childTeam: Team) => (
                <TeamCard
                  key={childTeam._id}
                  team={childTeam}
                  onEdit={() => openChildEditModal(childTeam._id)}
                  onDelete={() => openChildDeleteModal(childTeam._id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No child teams found.</p>
              <Link href={`/app/teams/create?parentId=${team._id}`}>
                <Button variant="outline" className="mt-4">
                  Create Child Team
                </Button>
              </Link>
            </div>
          )}

          {/* Team Hierarchy Tree */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Team Hierarchy</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <TeamTree teamId={team._id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditTeamModal
        teamId={team._id}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSuccess={closeEditModal}
      />

      <DeleteTeamModal
        teamId={team._id}
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onSuccess={handleDeleteSuccess}
      />

      {/* Child Team Modals */}
      {childTeamToEdit && (
        <EditTeamModal
          teamId={childTeamToEdit}
          isOpen={!!childTeamToEdit}
          onClose={closeChildEditModal}
          onSuccess={closeChildEditModal}
        />
      )}

      {childTeamToDelete && (
        <DeleteTeamModal
          teamId={childTeamToDelete}
          isOpen={!!childTeamToDelete}
          onClose={closeChildDeleteModal}
          onSuccess={closeChildDeleteModal}
        />
      )}
    </div>
  );
}
