'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils/date';
import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { Check, Loader2, Search, UserCheck, UserX, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AttendanceStatus, ParticipantAttendance } from '../../modules/attendance/types';

interface AttendanceMarkingTableProps {
  activityId: Id<'attendanceActivities'>;
  teamId: Id<'teams'>;
}

export function AttendanceMarkingTable({ activityId, teamId }: AttendanceMarkingTableProps) {
  const attendanceData = useSessionQuery(api.attendance.getAttendanceForActivity, { activityId });
  const markAttendance = useSessionMutation(api.attendance.markAttendance);

  const [updatingParticipantId, setUpdatingParticipantId] = useState<Id<'participants'> | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Handle marking attendance
  const handleMarkAttendance = async (
    participantId: Id<'participants'>,
    status: AttendanceStatus,
    notes?: string
  ) => {
    try {
      setUpdatingParticipantId(participantId);
      await markAttendance({
        activityId,
        participantId,
        status,
        notes,
      });
      toast.success('Attendance updated', {
        description: 'The attendance status has been updated successfully.',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update attendance status. Please try again.',
      });
      console.error('Failed to update attendance:', error);
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  // Format date for display
  const formatActivityDate = (timestamp: number) => {
    return formatDate(timestamp, 'FULL_DATE');
  };

  // Filter participants based on search
  const filteredParticipants = attendanceData?.attendanceRecords
    ? attendanceData.attendanceRecords.filter((record) =>
        record.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Loading state
  if (attendanceData === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Attendance</CardTitle>
          <CardDescription>Please wait while we load attendance data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{attendanceData.activity.name}</CardTitle>
          <CardDescription>
            Date: {formatActivityDate(attendanceData.activity.date)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredParticipants.length > 0 ? (
              <div className="grid gap-4">
                {/* Desktop view - traditional table */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[200px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((record) => (
                        <TableRow key={record.participant._id}>
                          <TableCell>{record.participant.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Button
                                variant={
                                  record.attendance?.status === AttendanceStatus.Present
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                className="w-24"
                                onClick={() =>
                                  handleMarkAttendance(
                                    record.participant._id,
                                    AttendanceStatus.Present,
                                    record.attendance?.notes
                                  )
                                }
                                disabled={updatingParticipantId === record.participant._id}
                              >
                                {updatingParticipantId === record.participant._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" /> Present
                                  </>
                                )}
                              </Button>
                              <Button
                                variant={
                                  record.attendance?.status === AttendanceStatus.Absent
                                    ? 'destructive'
                                    : 'outline'
                                }
                                size="sm"
                                className="w-24"
                                onClick={() =>
                                  handleMarkAttendance(
                                    record.participant._id,
                                    AttendanceStatus.Absent,
                                    record.attendance?.notes
                                  )
                                }
                                disabled={updatingParticipantId === record.participant._id}
                              >
                                {updatingParticipantId === record.participant._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" /> Absent
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile view - card-based list */}
                <div className="md:hidden space-y-4">
                  {filteredParticipants.map((record) => (
                    <div key={record.participant._id} className="border rounded-lg p-4 shadow-sm">
                      <div className="flex flex-col space-y-3">
                        <div className="text-lg font-medium">{record.participant.name}</div>
                        <div className="flex flex-row items-center gap-2 w-full">
                          <Button
                            variant={
                              record.attendance?.status === AttendanceStatus.Present
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleMarkAttendance(
                                record.participant._id,
                                AttendanceStatus.Present,
                                record.attendance?.notes
                              )
                            }
                            disabled={updatingParticipantId === record.participant._id}
                          >
                            {updatingParticipantId === record.participant._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" /> Present
                              </>
                            )}
                          </Button>
                          <Button
                            variant={
                              record.attendance?.status === AttendanceStatus.Absent
                                ? 'destructive'
                                : 'outline'
                            }
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleMarkAttendance(
                                record.participant._id,
                                AttendanceStatus.Absent,
                                record.attendance?.notes
                              )
                            }
                            disabled={updatingParticipantId === record.participant._id}
                          >
                            {updatingParticipantId === record.participant._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-2" /> Absent
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                {searchTerm
                  ? 'No participants found matching your search.'
                  : 'No participants in this team yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
