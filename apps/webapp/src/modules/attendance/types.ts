import type { Id } from '@workspace/backend/convex/_generated/dataModel';

/**
 * Attendance status enum values
 */
export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
}

/**
 * Attendance activity interface
 */
export interface AttendanceActivity {
  _id: Id<'attendanceActivities'>;
  name: string;
  date: number;
  teamId: Id<'teams'>;
  createdBy: Id<'users'>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Attendance record interface
 */
export interface AttendanceRecord {
  _id: Id<'attendanceRecords'>;
  activityId: Id<'attendanceActivities'>;
  participantId: Id<'participants'>;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: Id<'users'>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Participant interface (simplified for attendance purposes)
 */
export interface Participant {
  _id: Id<'participants'>;
  name: string;
  teamId: Id<'teams'>;
  joinDate: number;
}

/**
 * Combined participant with attendance status for display
 */
export interface ParticipantAttendance {
  participant: Participant;
  attendance: AttendanceRecord | null;
}

/**
 * Response from getAttendanceForActivity query
 */
export interface AttendanceForActivityResponse {
  activity: AttendanceActivity;
  attendanceRecords: ParticipantAttendance[];
}

/**
 * Response from getParticipantAttendanceHistory query
 */
export interface ParticipantAttendanceHistory {
  participant: Participant;
  attendanceHistory: Array<{
    record: AttendanceRecord;
    activity: AttendanceActivity | null;
  }>;
}

/**
 * Form data for creating a new attendance activity
 */
export interface CreateAttendanceActivityFormData {
  name?: string;
  date: Date;
  teamId: Id<'teams'>;
}

/**
 * Form data for marking attendance
 */
export interface MarkAttendanceFormData {
  activityId: Id<'attendanceActivities'>;
  participantId: Id<'participants'>;
  status: AttendanceStatus;
  notes?: string;
}
