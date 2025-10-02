'use client';

import { Separator } from '@/components/ui/separator';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ShareLinksList } from '../../../../../../components/teams/ShareLinksList';

interface ShareLinksPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function ShareLinksPage({ params }: ShareLinksPageProps) {
  const { teamId } = await params;

  // Validate teamId format - this will ensure we handle invalid IDs gracefully
  // We need to convert the string ID to a Convex ID type
  const teamIdAsId = teamId as Id<'teams'>;

  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Share Links</h1>
        <p className="text-muted-foreground">
          Create and manage share links to give others access to your team with specific
          permissions.
        </p>
      </div>

      <Separator />

      <ShareLinksList teamId={teamIdAsId} />
    </div>
  );
}
