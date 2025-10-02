'use client';

import { ParticipantList } from '@/components/participants/ParticipantList';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamParticipantsPage() {
  const params = useParams();
  const [teamId, setTeamId] = useState<Id<'teams'> | null>(null);

  useEffect(() => {
    if (params.teamId) {
      setTeamId(params.teamId as Id<'teams'>);
    }
  }, [params]);

  if (!teamId) {
    return <div className="p-4">Loading participants...</div>;
  }

  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6">Team Participants</h1>
      <ParticipantList teamId={teamId} />
    </div>
  );
}
