import { AttendanceMarkingTable } from '@/components/attendance/AttendanceMarkingTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface ActivityPageProps {
  params: Promise<{ teamId: string; activityId: string }>;
}

export default function ActivityPage({ params }: ActivityPageProps) {
  // Convert params to a React hook that suspends
  const resolvedParams = use(params);
  const { teamId, activityId } = resolvedParams;

  // Convert string IDs to Convex ID types
  const teamIdAsId = teamId as Id<'teams'>;
  const activityIdAsId = activityId as Id<'attendanceActivities'>;

  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link href={`/app/teams/${teamId}/attendance`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Attendance Details</h1>
      </div>

      <p className="text-muted-foreground text-sm md:text-base">
        Mark participants as present or absent for this activity.
      </p>

      <ErrorBoundary
        fallback={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Attendance
              </CardTitle>
              <CardDescription>
                The attendance activity could not be found or you do not have permission to view it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/app/teams/${teamId}/attendance`}>Go Back to Attendance List</Link>
              </Button>
            </CardContent>
          </Card>
        }
      >
        <AttendanceMarkingTable teamId={teamIdAsId} activityId={activityIdAsId} />
      </ErrorBoundary>
    </div>
  );
}

// Simple error boundary component
function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  try {
    return <>{children}</>;
  } catch (error) {
    return <>{fallback}</>;
  }
}
