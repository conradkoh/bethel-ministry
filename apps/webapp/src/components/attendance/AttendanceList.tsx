// @ts-nocheck - Unimplemented API functions and missing types
'use client';

import { formatDate } from '@/lib/utils/date';
import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { CalendarX, Loader2, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import type { AttendanceActivity } from '../../modules/attendance/types';

interface AttendanceListProps {
  teamId: Id<'teams'>;
}

interface DateFilters {
  startDate?: number;
  endDate?: number;
}

export function AttendanceList({ teamId }: AttendanceListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFrame, setTimeFrame] = useState('all');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingToCreate, setNavigatingToCreate] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Id<'attendanceActivities'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteActivity = useSessionMutation(api.attendance.deleteAttendanceActivity);

  // Calculate date filters based on time frame
  const getDateFilters = (): DateFilters => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    lastYear.setHours(0, 0, 0, 0);

    switch (timeFrame) {
      case 'week':
        return { startDate: lastWeek.getTime() };
      case 'month':
        return { startDate: lastMonth.getTime() };
      case 'year':
        return { startDate: lastYear.getTime() };
      default:
        return {};
    }
  };

  // Get activities with date filters
  const dateFilters = getDateFilters();
  const activities = useSessionQuery(api.attendance.listAttendanceActivities, {
    teamId,
    ...dateFilters,
  });

  // Filter activities by search term
  const filteredActivities = activities?.filter((activity: AttendanceActivity) =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view attendance for an activity
  const handleViewAttendance = (activityId: Id<'attendanceActivities'>) => {
    setIsNavigating(true);
    router.push(`/app/teams/${teamId}/attendance/${activityId}`);
  };

  // Handle create new activity
  const handleCreateActivity = () => {
    setNavigatingToCreate(true);
    router.push(`/app/teams/${teamId}/attendance/create`);
  };

  // Handle delete attendance activity
  const handleDeleteActivity = async (activityId: Id<'attendanceActivities'>) => {
    try {
      setIsDeleting(true);
      await deleteActivity({ activityId });
      toast.success('Attendance activity deleted successfully');
    } catch (error) {
      console.error('Error deleting attendance activity:', error);
      toast.error('Failed to delete attendance activity');
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
    }
  };

  // Format date for display
  const formatActivityDate = (timestamp: number) => {
    return formatDate(timestamp, 'FULL_DATE');
  };

  // Loading state
  if (activities === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  // Navigation in progress
  if (isNavigating || navigatingToCreate) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {navigatingToCreate ? 'Creating new activity...' : 'Loading activity details...'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CalendarX className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg mb-2">No attendance activities found.</p>
        <p className="text-muted-foreground mb-6">
          Create your first attendance activity to get started.
        </p>
        <Button onClick={handleCreateActivity}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Activity
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto" onClick={handleCreateActivity}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {filteredActivities && filteredActivities.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead className="w-1/3">Date</TableHead>
                <TableHead className="w-1/3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity: AttendanceActivity) => (
                <TableRow key={activity._id}>
                  <TableCell className="font-medium break-words">{activity.name}</TableCell>
                  <TableCell className="break-words">{formatActivityDate(activity.date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleViewAttendance(activity._id)}
                      >
                        View Attendance
                      </Button>
                      <AlertDialog
                        open={activityToDelete === activity._id}
                        onOpenChange={(open) => {
                          if (!open) setActivityToDelete(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10 w-full sm:w-auto"
                            onClick={() => setActivityToDelete(activity._id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[90vw] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Attendance Activity</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this attendance activity? This action
                              will permanently remove the activity and all its attendance records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteActivity(activity._id);
                              }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">No activities found matching your search.</p>
        </div>
      )}
    </div>
  );
}
