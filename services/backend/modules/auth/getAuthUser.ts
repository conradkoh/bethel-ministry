import type { SessionId } from 'convex-helpers/server/sessions';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';

export interface AuthUserResult {
  user: Doc<'users'>; // The authenticated user
  _id: Id<'users'>; // User ID for backward compatibility
  shareToken?: string; // Optional share token if the user is accessing via a share link
  shareTeamId?: Id<'teams'>; // Optional team ID if the user is accessing via a share link
  sharePermissions?: string[]; // Optional permissions if the user is accessing via a share link
}

export const getAuthUser = async (
  ctx: QueryCtx | MutationCtx,
  args: { sessionId: SessionId; shareToken?: string }
): Promise<AuthUserResult> => {
  const session = await ctx.db
    .query('sessions')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
    .first();
  if (!session) {
    throw new Error('Session not found');
  }

  // Session expiry is deprecated and no longer checked.

  const user = await ctx.db.get(session.userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if a share token was provided
  if (args.shareToken) {
    // Validate the share token
    const token = args.shareToken; // Assign to a const to satisfy TypeScript
    const shareLinks = await ctx.db
      .query('shareLinks')
      .withIndex('by_token', (q) => q.eq('token', token))
      .collect();

    if (shareLinks.length > 0) {
      const shareLink = shareLinks[0];

      // Check if the share link has expired
      if (!shareLink.expiresAt || shareLink.expiresAt > Date.now()) {
        return {
          user,
          _id: user._id, // Add _id for backward compatibility
          shareToken: token,
          shareTeamId: shareLink.teamId,
          sharePermissions: shareLink.permissions,
        };
      }
    }
  }

  return {
    user,
    _id: user._id, // Add _id for backward compatibility
  };
};
