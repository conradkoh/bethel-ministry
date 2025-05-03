'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import type { TeamHierarchy } from '@workspace/backend/convex/teams';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTeam, useTeamChildren, useTeamDescendants } from '../../hooks/useTeams';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';

interface TeamTreeProps {
  teamId: Id<'teams'>;
  onAddChild?: (parentId: Id<'teams'>) => void;
  onEdit?: (teamId: Id<'teams'>) => void;
  onDelete?: (teamId: Id<'teams'>) => void;
}

export function TeamTree({ teamId, onAddChild, onEdit, onDelete }: TeamTreeProps) {
  const { team, isLoading: isTeamLoading } = useTeam(teamId);
  const { descendants, isLoading: isDescendantsLoading } = useTeamDescendants(teamId);

  const isLoading = isTeamLoading || isDescendantsLoading;

  // Return loading skeleton if any data is still loading
  if (isLoading) {
    return <TeamTreeSkeleton />;
  }

  if (!team) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
        Failed to load team hierarchy
      </div>
    );
  }

  // Build a team hierarchy from the team and its descendants
  const rootTeam: TeamHierarchy = {
    ...team,
    children: [],
  };

  // Map to hold all teams by ID for easy lookup
  const teamsMap = new Map<string, TeamHierarchy>();
  teamsMap.set(team._id, rootTeam);

  // Process descendants (if available)
  if (descendants && descendants.length > 0) {
    // First pass: Create all team nodes
    for (const descendant of descendants) {
      const node: TeamHierarchy = { ...descendant, children: [] };
      teamsMap.set(descendant._id, node);
    }

    // Second pass: Connect parent-child relationships
    for (const descendant of descendants) {
      if (!descendant.parentId) continue;

      const node = teamsMap.get(descendant._id);
      const parentNode = teamsMap.get(String(descendant.parentId));

      if (node && parentNode && !parentNode.children.some((c) => c._id === node._id)) {
        parentNode.children.push(node);
      }
    }
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-lg font-medium">Team Hierarchy</h3>
      <div className="space-y-2">
        <TeamTreeNode
          team={rootTeam}
          level={0}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

interface TeamTreeNodeProps {
  team: TeamHierarchy;
  level: number;
  onAddChild?: (parentId: Id<'teams'>) => void;
  onEdit?: (teamId: Id<'teams'>) => void;
  onDelete?: (teamId: Id<'teams'>) => void;
}

function TeamTreeNode({ team, level, onAddChild, onEdit, onDelete }: TeamTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();
  const hasChildren = team.children.length > 0;
  const indentation = `${level * 1.5}rem`;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClick = () => {
    router.push(`/app/teams/${team._id}`);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild?.(team._id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(team._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(team._id);
  };

  return (
    <div className="space-y-2">
      <div
        className="flex items-center rounded-md border border-transparent p-2 hover:bg-muted/50"
        style={{ paddingLeft: indentation }}
      >
        {hasChildren ? (
          <Button variant="ghost" size="icon" className="mr-1 h-6 w-6" onClick={handleToggle}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="mr-1 h-6 w-6" />
        )}

        <Button
          className="flex flex-1 cursor-pointer items-center justify-between"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
          tabIndex={0}
          aria-label={`Navigate to ${team.name} team`}
        >
          <span className="font-medium">{team.name}</span>

          <div className="flex items-center space-x-1">
            {onAddChild && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleAddChild}
                title="Add child team"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleEdit}
                title="Edit team"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={handleDelete}
                title="Delete team"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Button>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {team.children.map((child) => (
            <TeamTreeNode
              key={child._id}
              team={child}
              level={level + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamTreeSkeleton() {
  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-lg font-medium">Team Hierarchy</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="ml-6 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="ml-6 space-y-2">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
