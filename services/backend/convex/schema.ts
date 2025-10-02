import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// DEPRECATION NOTICE: The fields `expiresAt` and `expiresAtLabel` in the sessions table are deprecated and no longer used for session expiry. They are only kept for migration compatibility and will be removed in a future migration.

// Attendance status enum values (used for type safety in code)
export const AttendanceStatus = {
  Present: 'present',
  Absent: 'absent',
} as const;

export type AttendanceStatusType = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// Team permission enum values (used for share links and access control)
export const TeamPermission = {
  ViewTeam: 'view-team',
  ManageParticipants: 'manage-participants',
  ViewParticipants: 'view-participants',
  ManageAttendance: 'manage-attendance',
  ViewAttendance: 'view-attendance',
  ViewReports: 'view-reports',
} as const;

export type TeamPermissionType = (typeof TeamPermission)[keyof typeof TeamPermission];

export default defineSchema({
  appInfo: defineTable({
    latestVersion: v.string(),
  }),
  presentationState: defineTable({
    key: v.string(), // The presentation key that identifies this presentation
    currentSlide: v.number(), // The current slide number
    lastUpdated: v.number(), // Timestamp of last update
  }).index('by_key', ['key']),

  // auth
  users: defineTable(
    v.union(
      v.object({
        type: v.literal('full'),
        name: v.string(),
        username: v.string(),
        email: v.string(),
        recoveryCode: v.optional(v.string()),
      }),
      v.object({
        type: v.literal('anonymous'),
        name: v.string(), //system generated name
        recoveryCode: v.optional(v.string()),
      })
    )
  )
    .index('by_username', ['username'])
    .index('by_email', ['email'])
    .index('by_name', ['name']),

  //sessions
  sessions: defineTable({
    sessionId: v.string(), //this is provided by the client
    userId: v.id('users'), // null means session exists but not authenticated
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
    expiresAtLabel: v.optional(v.string()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
  }).index('by_sessionId', ['sessionId']),

  //login codes for cross-device authentication
  loginCodes: defineTable({
    code: v.string(), // The 8-letter login code
    userId: v.id('users'), // The user who generated this code
    createdAt: v.number(), // When the code was created
    expiresAt: v.number(), // When the code expires (1 minute after creation)
  }).index('by_code', ['code']),

  // Teams - Hierarchical organization structure
  teams: defineTable({
    name: v.string(), // Team name
    timezone: v.string(), // Team timezone
    ownerId: v.id('users'), // User who owns the team
    parentId: v.optional(v.id('teams')), // Parent team ID (null for root teams)
    path: v.string(), // Hierarchical path string (format: /id1/id2/id3/)
    createdAt: v.number(), // Timestamp when team was created
    updatedAt: v.number(), // Timestamp when team was last updated
  })
    .index('by_parent', ['parentId']) // For easy fetching of child teams
    .index('by_owner', ['ownerId']) // For fetching teams owned by a user
    .index('by_path', ['path']), // For efficient hierarchical queries

  // Participants - Team members who can be tracked for attendance
  participants: defineTable({
    name: v.string(), // Participant's name
    teamId: v.id('teams'), // Team this participant belongs to
    joinDate: v.number(), // Timestamp when participant joined
    createdAt: v.number(), // Timestamp when record was created
    updatedAt: v.number(), // Timestamp when record was last updated
  }).index('by_team', ['teamId']), // For fetching participants in a team

  // Attendance Activities - Represents a specific date/event for tracking attendance
  attendanceActivities: defineTable({
    name: v.string(), // Optional name for the activity (e.g., "Sunday Service")
    date: v.number(), // Date of the activity (timestamp)
    teamId: v.id('teams'), // Team this activity belongs to
    createdBy: v.id('users'), // User who created the activity
    createdAt: v.number(), // Timestamp when record was created
    updatedAt: v.number(), // Timestamp when record was last updated
  })
    .index('by_team', ['teamId']) // For fetching activities for a team
    .index('by_team_and_date', ['teamId', 'date']), // For fetching activities for a team on a specific date

  // Attendance Records - Individual attendance records for participants
  attendanceRecords: defineTable({
    activityId: v.id('attendanceActivities'), // Activity this record belongs to
    participantId: v.id('participants'), // Participant this record is for
    status: v.string(), // Attendance status (present, absent) - uses AttendanceStatus enum values
    notes: v.optional(v.string()), // Optional notes about attendance
    recordedBy: v.id('users'), // User who recorded this attendance
    createdAt: v.number(), // Timestamp when record was created
    updatedAt: v.number(), // Timestamp when record was last updated
  })
    .index('by_activity', ['activityId']) // For fetching all records for an activity
    .index('by_participant', ['participantId']) // For fetching attendance history for a participant
    .index('by_activity_and_participant', ['activityId', 'participantId']), // For fetching a specific record

  // Share Links - Links that can be shared with others to grant specific permissions
  shareLinks: defineTable({
    name: v.string(), // Display name for the share link
    teamId: v.id('teams'), // Team this share link is for
    createdBy: v.id('users'), // User who created the share link
    permissions: v.array(v.string()), // Array of permission strings (uses TeamPermission enum values)
    token: v.string(), // Unique token for accessing the team via this link
    expiresAt: v.optional(v.number()), // Optional expiration timestamp
    createdAt: v.number(), // Timestamp when the share link was created
    updatedAt: v.number(), // Timestamp when the share link was last updated
  })
    .index('by_team', ['teamId']) // For fetching all share links for a team
    .index('by_token', ['token']), // For validating a share link token
});
