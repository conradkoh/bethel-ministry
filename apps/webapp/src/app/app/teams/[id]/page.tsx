'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamTree } from '@/components/teams/TeamTree';
import { DeleteTeamModal } from '@/components/teams/modals/DeleteTeamModal';
import { EditTeamModal } from '@/components/teams/modals/EditTeamModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeam, useTeamChildren } from '@/hooks/useTeams';
import { Team } from '@/lib/types/team';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft, Edit, Trash, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [teamId, setTeamId] = useState<Id<'teams'> | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [childTeamToEdit, setChildTeamToEdit] = useState<Id<'teams'> | null>(null);
  const [childTeamToDelete, setChildTeamToDelete] = useState<Id<'teams'> | null>(null);

  // Get the ID from params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setTeamId(resolvedParams.id as Id<'teams'>);
      }
    };

    loadParams();
  }, [params]);

  // Fetch team data
  const { team, isLoading, error } = useTeam(teamId);
  const { children: childTeams, isLoading: isLoadingChildren } = useTeamChildren(teamId);

  // Modal handlers
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Child team modal handlers
  const handleEditChildTeam = (id: Id<'teams'>) => {
    setChildTeamToEdit(id);
  };

  const handleDeleteChildTeam = (id: Id<'teams'>) => {
    setChildTeamToDelete(id);
  };

  const closeChildEditModal = () => setChildTeamToEdit(null);
  const closeChildDeleteModal = () => setChildTeamToDelete(null);

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    router.push('/app/teams');
  };

  // Render loading state
  if (isLoading || !teamId) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  // Render error state
  if (error || !team) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
            <Button variant="outline" onClick={openEditModal}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Team
            </Button>
            <Button variant="destructive" onClick={openDeleteModal}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Team
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4">Team Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Team Name</h3>
                <p className="mt-1">{team.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
                <p className="mt-1">{team.timezone || 'Not specified'}</p>
              </div>

              {team.parentId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Parent Team</h3>
                  <p className="mt-1">
                    {/* Would need to fetch parent team name */}
                    <Link
                      href={`/app/teams/${team.parentId}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Parent Team
                    </Link>
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{new Date(team._creationTime).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>Team members feature coming soon</p>
            </div>
          </div>
        </div>

        {/* Child Teams Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Child Teams</h2>
            <Link href={`/app/teams/create?parentId=${team._id}`}>
              <Button size="sm">Add Child Team</Button>
            </Link>
          </div>

          {isLoadingChildren ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
            </div>
          ) : childTeams && childTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childTeams.map((child) => (
                <TeamCard
                  key={child._id}
                  team={child}
                  onEdit={() => handleEditChildTeam(child._id)}
                  onDelete={() => handleDeleteChildTeam(child._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No child teams found</p>
              <p className="text-sm mt-2">Add a child team to start building your hierarchy</p>
            </div>
          )}
        </div>

        {/* Team Hierarchy */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Team Hierarchy</h2>
          <TeamTree
            teamId={team._id}
            onAddChild={(parentId) => router.push(`/app/teams/create?parentId=${parentId}`)}
            onEdit={handleEditChildTeam}
            onDelete={handleDeleteChildTeam}
          />
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
    </DashboardLayout>
  );
}
