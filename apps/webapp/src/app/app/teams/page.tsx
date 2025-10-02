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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeamsPage() {
  // Get teams data
  const { teams, isLoading, error } = useMyTeams();
  const router = useRouter();

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

  const title = 'Teams';

  // Render loading state
  if (isLoading) {
    return (
      <div className="container p-6">
        <h1 className="mb-8 text-3xl font-bold">{title}</h1>
        <div className="mt-4 text-center">Loading teams...</div>
      </div>
    );
  }

  // Render error state
  if (error || !teams) {
    return (
      <div className="container p-6">
        <h1 className="mb-8 text-3xl font-bold">{title}</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load teams. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button onClick={openCreateModal}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <div className="hidden md:grid gap-6 md:grid-cols-3 mb-8">
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
            <div className="min-w-full">
              {/* Table header - visible on md and larger screens */}
              <div className="hidden md:flex bg-gray-100 rounded-t-md">
                <div className="w-1/3 px-4 py-2 font-medium text-left">Team Name</div>
                <div className="w-1/4 px-4 py-2 font-medium text-left">Members</div>
                <div className="w-1/4 px-4 py-2 font-medium text-left">Parent Team</div>
                <div className="w-1/6 px-4 py-2 font-medium text-left">Actions</div>
              </div>

              {/* Teams list */}
              <div className="divide-y">
                {teams.map((team) => {
                  // Create navigation handler that works with the dropdown menu
                  const navigateToTeam = () => {
                    router.push(`/app/teams/${team._id}`);
                  };

                  return (
                    <div
                      key={team._id}
                      className="relative flex flex-col md:flex-row md:items-center hover:bg-gray-50 transition-colors"
                    >
                      {/* Clickable area that covers the entire row except for the action menu */}
                      <div
                        className="absolute inset-0 cursor-pointer z-0"
                        onClick={navigateToTeam}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigateToTeam();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View team ${team.name}`}
                      />

                      {/* Team name - primary information shown on all screens */}
                      <div className="flex justify-between items-center w-full md:w-1/3 px-4 py-3">
                        <span className="font-medium text-blue-600">{team.name}</span>

                        {/* Mobile actions - only show on small screens */}
                        <div className="md:hidden z-10 relative">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={navigateToTeam}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/app/teams/${team._id}/attendance/create`)
                                }
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Mark Attendance
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(team)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteModal(team)}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Additional columns - hidden on mobile, visible on md+ screens */}
                      <div className="hidden md:block w-1/4 px-4 py-3">
                        {/* Replace with actual members count */}--
                      </div>
                      <div className="hidden md:block w-1/4 px-4 py-3">
                        {team.parentId ? 'Has Parent' : '--'}
                      </div>

                      {/* Desktop actions - hidden on mobile */}
                      <div className="hidden md:flex md:w-1/6 px-4 py-3 justify-end z-10 relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={navigateToTeam}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/app/teams/${team._id}/attendance/create`)
                              }
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Mark Attendance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(team)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(team)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
}
