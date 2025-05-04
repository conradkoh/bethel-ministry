import { AttendanceList } from '@/components/attendance/AttendanceList';
import { Skeleton } from '@/components/ui/skeleton';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { use } from 'react';

interface AttendancePageProps {
  params: Promise<{ teamId: string }>;
}

export default function AttendancePage({ params }: AttendancePageProps) {
  // Convert params to a React hook that suspends
  const resolvedParams = use(params);
  const teamId = resolvedParams.teamId;

  // Validate teamId format - this will ensure we handle invalid IDs gracefully
  // We need to convert the string ID to a Convex ID type
  const teamIdAsId = teamId as Id<'teams'>;

  return (
    <div className="container px-4 sm:px-6 py-6 space-y-6 max-w-full sm:max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Manage and track attendance for your team members.</p>
      </div>

      <AttendanceList teamId={teamIdAsId} />
    </div>
  );
}
