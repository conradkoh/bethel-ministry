import { AttendanceForm } from '@/components/attendance/AttendanceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface CreateAttendancePageProps {
  params: Promise<{ teamId: string }>;
}

export default function CreateAttendancePage({ params }: CreateAttendancePageProps) {
  // Convert params to a React hook that suspends
  const resolvedParams = use(params);
  const { teamId } = resolvedParams;

  // Convert string ID to Convex ID type
  const teamIdAsId = teamId as Id<'teams'>;

  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link href={`/app/teams/${teamId}/attendance`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Create Attendance Activity</h1>
      </div>

      <p className="text-muted-foreground text-sm md:text-base">
        Create a new attendance activity for your team.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>New Attendance Activity</CardTitle>
          <CardDescription>
            Fill out the form below to create a new attendance activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceForm teamId={teamIdAsId} />
        </CardContent>
      </Card>
    </div>
  );
}
