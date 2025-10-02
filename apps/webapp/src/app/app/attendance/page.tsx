'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils/date';
import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { Calendar, CalendarPlus, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Activity {
  _id: Id<'attendanceActivities'>;
  name: string;
  teamName?: string;
  teamId: Id<'teams'>;
  date: number;
}

interface Team {
  _id: Id<'teams'>;
  name: string;
  timezone: string;
  ownerId: Id<'users'>;
}

export default function AttendancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('recent');

  // Get all teams the user has access to
  const teams = useSessionQuery(api.teams.listOwnedTeams);

  // Get recent attendance activities across all teams
  const recentActivities = useSessionQuery(api.attendance.listRecentAttendanceActivities, {});

  // Filter teams by search term
  const filteredTeams =
    teams?.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  // Filter activities by search term
  const filteredActivities =
    recentActivities?.filter(
      (activity: Activity) =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    ) || [];

  // Format date for display
  const formatActivityDate = (timestamp: number) => {
    return formatDate(timestamp, 'FULL_DATE');
  };

  // Handle team selection for attendance
  const handleTeamSelect = (teamId: Id<'teams'>) => {
    router.push(`/app/teams/${teamId}/attendance`);
  };

  // Handle direct attendance creation
  const handleCreateAttendance = (teamId: Id<'teams'>) => {
    router.push(`/app/teams/${teamId}/attendance/create`);
  };

  // Handle view attendance for an activity
  const handleViewAttendance = (teamId: Id<'teams'>, activityId: Id<'attendanceActivities'>) => {
    router.push(`/app/teams/${teamId}/attendance/${activityId}`);
  };

  // Loading state
  if (teams === undefined || recentActivities === undefined) {
    return (
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Attendance</h1>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="flex flex-col space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
      </div>

      <div className="mb-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or activities..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="recent" onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent Activities</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Activities</CardTitle>
                <CardDescription>
                  View and manage attendance activities across all teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredActivities.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Activity</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivities.map((activity: Activity) => (
                          <TableRow key={activity._id}>
                            <TableCell className="font-medium">{activity.name}</TableCell>
                            <TableCell>{activity.teamName}</TableCell>
                            <TableCell>{formatActivityDate(activity.date)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAttendance(activity.teamId, activity._id)}
                              >
                                View Attendance
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">No Activities Found</h2>
                      <p className="text-gray-500 max-w-md mb-6">
                        {searchTerm
                          ? 'No activities match your search. Try a different search term.'
                          : "You haven't created any attendance activities yet."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Select a team to view or take attendance</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTeams.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team Name</TableHead>
                          <TableHead>Timezone</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeams.map((team: Team) => (
                          <TableRow key={team._id}>
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell>{team.timezone}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTeamSelect(team._id)}
                                >
                                  View Attendance
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleCreateAttendance(team._id)}
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Take Attendance
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
                      <p className="text-gray-500 max-w-md mb-6">
                        {searchTerm
                          ? 'No teams match your search. Try a different search term.'
                          : "You don't have any teams yet. Create a team to get started."}
                      </p>
                      <Button onClick={() => router.push('/app/teams')}>Manage Teams</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
