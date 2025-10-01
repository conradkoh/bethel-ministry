'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTeamShareLinks, useUpdateShareLink } from '../../../hooks/useShareLinks';
import {
  TeamPermission,
  type TeamPermissionType,
  getPermissionDescription,
  getPermissionLabel,
} from '../../../lib/types/shareLink';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoIcon } from 'lucide-react';

interface EditShareLinkModalProps {
  shareLinkId: Id<'shareLinks'> | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditShareLinkModal({ shareLinkId, isOpen, onClose }: EditShareLinkModalProps) {
  const { updateShareLink } = useUpdateShareLink();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([TeamPermission.ViewTeam]);
  const [expiration, setExpiration] = useState<string>('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<Id<'teams'> | null>(null);

  // Get all share links to find the one we're editing
  const { shareLinks, isLoading } = useTeamShareLinks(teamId as Id<'teams'>);
  const shareLink = shareLinkId ? shareLinks?.find((link) => link._id === shareLinkId) : null;

  // When the share link ID changes, update the form
  useEffect(() => {
    if (shareLink) {
      setName(shareLink.name);
      setPermissions(shareLink.permissions);
      setTeamId(shareLink.teamId);

      // Determine expiration option
      if (!shareLink.expiresAt) {
        setExpiration('never');
      } else {
        const now = Date.now();
        const diff = shareLink.expiresAt - now;
        const days = Math.round(diff / (1000 * 60 * 60 * 24));

        if (days <= 1) {
          setExpiration('1day');
        } else if (days <= 7) {
          setExpiration('7days');
        } else {
          setExpiration('30days');
        }
      }
    }
  }, [shareLink]);

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset form after closing animation
      setTimeout(() => {
        setError(null);
      }, 300);
    }
  };

  // Toggle permission in the array
  const togglePermission = (permission: string) => {
    setPermissions((current) => {
      // Always include ViewTeam as it's the base permission
      if (permission === TeamPermission.ViewTeam) return current;

      if (current.includes(permission)) {
        return current.filter((p) => p !== permission);
      }
      return [...current, permission];
    });
  };

  // Calculate expiration date based on selection
  const getExpirationDate = (): number | null => {
    switch (expiration) {
      case 'never':
        return null;
      case '1day':
        return addDays(new Date(), 1).getTime();
      case '7days':
        return addDays(new Date(), 7).getTime();
      case '30days':
        return addDays(new Date(), 30).getTime();
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareLinkId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure ViewTeam is always included
      const finalPermissions = permissions.includes(TeamPermission.ViewTeam)
        ? permissions
        : [...permissions, TeamPermission.ViewTeam];

      await updateShareLink(shareLinkId, {
        name: name.trim(),
        permissions: finalPermissions as TeamPermissionType[],
        expiresAt: getExpirationDate(),
      });

      onClose();
    } catch (err) {
      console.error('Failed to update share link:', err);
      setError(err instanceof Error ? err.message : 'Failed to update share link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && shareLinkId) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Share Link</DialogTitle>
            <DialogDescription>
              Update the permissions and settings for this share link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Share Link</DialogTitle>
          <DialogDescription>
            Update the permissions and settings for this share link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Link Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Leaders, Volunteers, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="space-y-2">
              {Object.values(TeamPermission).map((permission) => (
                <div key={permission} className="flex items-start space-x-2">
                  <Checkbox
                    id={permission}
                    checked={permissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                    disabled={permission === TeamPermission.ViewTeam} // ViewTeam is always required
                  />
                  <div className="grid gap-1">
                    <Label
                      htmlFor={permission}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {getPermissionLabel(permission)}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getPermissionDescription(permission)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Link Expiration</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger id="expiration">
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="1day">1 day</SelectItem>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-destructive flex items-center gap-1">
              <InfoIcon className="h-4 w-4" />
              {error}
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
