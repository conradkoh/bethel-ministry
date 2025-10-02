import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { TeamPermission } from '@workspace/backend/convex/schema';

/**
 * ShareLink interface representing a share link in the system
 * Maps to the shareLinks table in the database
 */
export interface ShareLink {
  _id: Id<'shareLinks'>;
  _creationTime: number;
  name: string;
  teamId: Id<'teams'>;
  createdBy: Id<'users'>;
  permissions: string[]; // Array of TeamPermission values
  token: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Re-export TeamPermission enum for use in frontend components
 */
export { TeamPermission };
export type TeamPermissionType = (typeof TeamPermission)[keyof typeof TeamPermission];

/**
 * ShareLinkFormData interface for share link creation/editing forms
 */
export interface ShareLinkFormData {
  name: string;
  permissions: TeamPermissionType[];
  expiresAt?: number | null;
}

/**
 * Helper function to get a human-readable label for a permission
 */
export function getPermissionLabel(permission: TeamPermissionType): string {
  switch (permission) {
    case TeamPermission.ViewTeam:
      return 'View Team';
    case TeamPermission.ManageParticipants:
      return 'Manage Participants';
    case TeamPermission.ViewParticipants:
      return 'View Participants';
    case TeamPermission.ManageAttendance:
      return 'Manage Attendance';
    case TeamPermission.ViewAttendance:
      return 'View Attendance';
    case TeamPermission.ViewReports:
      return 'View Reports';
    default:
      return permission;
  }
}

/**
 * Helper function to get a description for a permission
 */
export function getPermissionDescription(permission: TeamPermissionType): string {
  switch (permission) {
    case TeamPermission.ViewTeam:
      return 'Can view basic team information';
    case TeamPermission.ManageParticipants:
      return 'Can add, edit, and remove participants';
    case TeamPermission.ViewParticipants:
      return 'Can view participant information';
    case TeamPermission.ManageAttendance:
      return 'Can create attendance activities and mark attendance';
    case TeamPermission.ViewAttendance:
      return 'Can view attendance records';
    case TeamPermission.ViewReports:
      return 'Can view attendance reports and statistics';
    default:
      return '';
  }
}
