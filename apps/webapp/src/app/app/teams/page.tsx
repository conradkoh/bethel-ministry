'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { TeamCard } from '../../../components/teams/TeamCard';
import { CreateTeamModal } from '../../../components/teams/modals/CreateTeamModal';
import { DeleteTeamModal } from '../../../components/teams/modals/DeleteTeamModal';
import { EditTeamModal } from '../../../components/teams/modals/EditTeamModal';
import { useMyTeams } from '../../../hooks/useTeams';
import type { Team } from '../../../lib/types/team';

import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, UsersRound } from 'lucide-react';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  // Get teams data
  const { teams, isLoading, error } = useMyTeams();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTeamId, setEditTeamId] = useState<Id<'teams'> | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<Id<'teams'> | null>(null);

  // Modal handlers
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (team: Team) => setEditTeamId(team._id);
  const closeEditModal = () => setEditTeamId(null);

  const openDeleteModal = (team: Team) => setDeleteTeamId(team._id);
  const closeDeleteModal = () => setDeleteTeamId(null);

  // Calculate team stats from actual data
  const teamStats = {
    totalTeams: teams?.length || 0,
    yourTeams: teams?.length || 0,
    members: 0, // We would need member data to calculate this properly
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">My Teams</h1>
        <div className="mt-4 text-center">Loading teams...</div>
      </div>
    );
  }

  // Render error state
  if (error || !teams) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">My Teams</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load teams. Please try again.
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teams</h1>
          <Button onClick={openCreateModal}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <DashboardCard
            title="Total Teams"
            value={teamStats.totalTeams}
            icon={<Users className="h-5 w-5" />}
            description="Across all ministries"
            linkHref="/app/teams/all"
            linkText="View All Teams"
          />

          <DashboardCard
            title="Your Teams"
            value={teamStats.yourTeams}
            icon={<UsersRound className="h-5 w-5" />}
            description="Teams you belong to"
            linkHref="/app/teams/my-teams"
            linkText="View Your Teams"
            variant="success"
          />

          <DashboardCard
            title="Team Members"
            value={teamStats.members}
            icon={<Users className="h-5 w-5" />}
            description="Total people in your teams"
            linkHref="/app/teams/members"
            linkText="View Members"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Teams</h2>

          {teams.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <h3 className="mb-2 text-xl font-medium">No teams found</h3>
              <p className="mb-4 text-muted-foreground">
                You don&apos;t have any teams yet. Create your first team to get started.
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Team Name</th>
                    <th className="px-4 py-2 text-left">Members</th>
                    <th className="px-4 py-2 text-left">Parent Team</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team._id} className="border-b">
                      <td className="px-4 py-3">{team.name}</td>
                      <td className="px-4 py-3">{/* Replace with actual members count */}--</td>
                      <td className="px-4 py-3">{team.parentId ? 'Has Parent' : '--'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/app/teams/${team._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => openEditModal(team)}
                            className="text-amber-600 hover:underline"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(team)}
                            className="text-red-600 hover:underline"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={() => {
          closeCreateModal();
          // No need to refresh as Convex will automatically update the data
        }}
      />

      <EditTeamModal
        teamId={editTeamId}
        isOpen={!!editTeamId}
        onClose={closeEditModal}
        onSuccess={() => {
          closeEditModal();
          // No need to refresh as Convex will automatically update the data
        }}
      />

      <DeleteTeamModal
        teamId={deleteTeamId}
        isOpen={!!deleteTeamId}
        onClose={closeDeleteModal}
        onSuccess={() => {
          closeDeleteModal();
          // No need to refresh as Convex will automatically update the data
        }}
      />
    </DashboardLayout>
  );
}
