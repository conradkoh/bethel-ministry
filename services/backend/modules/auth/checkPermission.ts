import type { Id } from '../../convex/_generated/dataModel';
import type { QueryCtx } from '../../convex/_generated/server';
import type { TeamPermissionType } from '../../convex/schema';

/**
 * Check if a user has a specific permission for a team
 * This can be either because they are the team owner or because they have been granted the permission via a share link
 */
export async function checkPermission(
  ctx: QueryCtx,
  userId: Id<'users'>,
  teamId: Id<'teams'>,
  permission: TeamPermissionType,
  shareToken?: string
): Promise<boolean> {
  // First, check if the user is the team owner
  const team = await ctx.db.get(teamId);
  if (!team) {
    return false;
  }

  // Team owners have all permissions
  if (team.ownerId === userId) {
    return true;
  }

  // If no share token is provided, the user doesn't have the permission
  if (!shareToken) {
    return false;
  }

  // Check if the share token is valid and grants the required permission
  const token = shareToken; // Assign to a const to satisfy TypeScript
  const shareLinks = await ctx.db
    .query('shareLinks')
    .withIndex('by_token', (q) => q.eq('token', token))
    .collect();

  if (shareLinks.length === 0) {
    return false;
  }

  const shareLink = shareLinks[0];

  // Check if the share link is for the correct team
  if (shareLink.teamId !== teamId) {
    return false;
  }

  // Check if the share link has expired
  if (shareLink.expiresAt && shareLink.expiresAt < Date.now()) {
    return false;
  }

  // Check if the share link grants the required permission
  return shareLink.permissions.includes(permission);
}
