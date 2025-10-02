'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useTeamShareLinks } from '../../hooks/useShareLinks';
import { type TeamPermissionType, getPermissionLabel } from '../../lib/types/shareLink';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, Link2Off, MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { CreateShareLinkModal } from './modals/CreateShareLinkModal';
import { DeleteShareLinkModal } from './modals/DeleteShareLinkModal';
import { EditShareLinkModal } from './modals/EditShareLinkModal';

interface ShareLinksListProps {
  teamId: Id<'teams'>;
}

export function ShareLinksList({ teamId }: ShareLinksListProps) {
  const { shareLinks, isLoading } = useTeamShareLinks(teamId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editShareLinkId, setEditShareLinkId] = useState<Id<'shareLinks'> | null>(null);
  const [deleteShareLinkId, setDeleteShareLinkId] = useState<Id<'shareLinks'> | null>(null);

  // Modal handlers
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const openEditModal = (id: Id<'shareLinks'>) => setEditShareLinkId(id);
  const closeEditModal = () => setEditShareLinkId(null);
  const openDeleteModal = (id: Id<'shareLinks'>) => setDeleteShareLinkId(id);
  const closeDeleteModal = () => setDeleteShareLinkId(null);

  // Copy share link to clipboard
  const copyShareLink = (token: string) => {
    const url = new URL(window.location.origin);
    url.pathname = `/teams/share/${token}`;

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        // You can add a toast notification here
        alert('Link copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy URL:', error);
        alert('Failed to copy link. Please try again.');
      });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Share Links</h2>
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-48" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Share Links</h2>
        <Button onClick={openCreateModal} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Share Link
        </Button>
      </div>

      {shareLinks && shareLinks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No share links yet</CardTitle>
            <CardDescription>
              Create a share link to allow others to access this team with specific permissions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={openCreateModal} variant="outline" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create your first share link
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {shareLinks?.map((shareLink) => (
            <Card key={shareLink._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{shareLink.name}</CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(shareLink.createdAt, { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyShareLink(shareLink.token)}>
                        <Link className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(shareLink._id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteModal(shareLink._id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {shareLink.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {getPermissionLabel(permission as TeamPermissionType)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {shareLink.expiresAt ? (
                  <div className="flex items-center gap-1">
                    <Link2Off className="h-3 w-3" />
                    Expires {formatDistanceToNow(shareLink.expiresAt, { addSuffix: true })}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    No expiration
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateShareLinkModal teamId={teamId} isOpen={isCreateModalOpen} onClose={closeCreateModal} />

      <EditShareLinkModal
        shareLinkId={editShareLinkId}
        isOpen={!!editShareLinkId}
        onClose={closeEditModal}
      />

      <DeleteShareLinkModal
        shareLinkId={deleteShareLinkId}
        isOpen={!!deleteShareLinkId}
        onClose={closeDeleteModal}
      />
    </div>
  );
}
