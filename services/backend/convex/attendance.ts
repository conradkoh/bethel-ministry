import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser';
import { type Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { AttendanceStatus, AttendanceStatusType } from './schema';

// Define type for Attendance related documents
export type AttendanceRecord = Doc<'attendanceRecords'>;
export type AttendanceActivity = Doc<'attendanceActivities'>;

/**
 * Create a new attendance activity for a team
 * @param date The date of the activity
 * @param teamId The team ID
 * @param name Optional name for the activity
 */
export const createAttendanceActivity = mutation({
  args: {
    date: v.number(), // Timestamp for the activity date
    teamId: v.id('teams'),
    name: v.optional(v.string()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team to verify it exists and user has access
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to manage this team
    // In this version, just check if user is the owner
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to create attendance activities for this team');
    }

    // Create the attendance activity
    const now = Date.now();
    const activityId = await ctx.db.insert('attendanceActivities', {
      name: args.name || `Attendance for ${new Date(args.date).toLocaleDateString()}`,
      date: args.date,
      teamId: args.teamId,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return activityId;
  },
});

/**
 * Mark a participant's attendance for an activity
 * @param activityId The attendance activity ID
 * @param participantId The participant ID
 * @param status The attendance status (present or absent)
 * @param notes Optional notes
 */
export const markAttendance = mutation({
  args: {
    activityId: v.id('attendanceActivities'),
    participantId: v.id('participants'),
    status: v.string(), // Using the AttendanceStatus enum values
    notes: v.optional(v.string()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the activity
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error('Attendance activity not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(activity.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to manage this team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to mark attendance for this team');
    }

    // Verify the participant exists and belongs to the same team
    const participant = await ctx.db.get(args.participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (participant.teamId !== activity.teamId) {
      throw new Error('Participant does not belong to the team for this activity');
    }

    // Validate attendance status
    if (args.status !== AttendanceStatus.Present && args.status !== AttendanceStatus.Absent) {
      throw new Error('Invalid attendance status');
    }

    // Check if an attendance record already exists
    const existingRecord = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_activity_and_participant', (q) =>
        q.eq('activityId', args.activityId).eq('participantId', args.participantId)
      )
      .first();

    const now = Date.now();

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, {
        status: args.status,
        notes: args.notes,
        recordedBy: user._id,
        updatedAt: now,
      });
      return existingRecord._id;
    }
    // Create new record
    const recordId = await ctx.db.insert('attendanceRecords', {
      activityId: args.activityId,
      participantId: args.participantId,
      status: args.status,
      notes: args.notes,
      recordedBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
    return recordId;
  },
});

/**
 * List attendance activities for a team
 * @param teamId The team ID
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 */
export const listAttendanceActivities = query({
  args: {
    teamId: v.id('teams'),
    startDate: v.optional(v.number()), // Optional start date filter
    endDate: v.optional(v.number()), // Optional end date filter
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the team to verify it exists and user has access
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to view this team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to view attendance activities for this team');
    }

    // Query attendance activities for the team
    let activitiesQuery = ctx.db
      .query('attendanceActivities')
      .withIndex('by_team', (q) => q.eq('teamId', args.teamId));

    // Apply date filters if provided
    if (args.startDate !== undefined && args.endDate !== undefined) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.and(
          q.gte(q.field('date'), args.startDate as number),
          q.lte(q.field('date'), args.endDate as number)
        )
      );
    } else if (args.startDate !== undefined) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.gte(q.field('date'), args.startDate as number)
      );
    } else if (args.endDate !== undefined) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.lte(q.field('date'), args.endDate as number)
      );
    }

    // Sort by date (newest first)
    const orderedActivities = activitiesQuery.order('desc');

    return await orderedActivities.collect();
  },
});

/**
 * Get attendance records for a specific activity
 * @param activityId The attendance activity ID
 */
export const getAttendanceForActivity = query({
  args: {
    activityId: v.id('attendanceActivities'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the activity
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error('Attendance activity not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(activity.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to view this team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to view attendance for this team');
    }

    // Get all attendance records for this activity
    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_activity', (q) => q.eq('activityId', args.activityId))
      .collect();

    // Get all participants for this team
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_team', (q) => q.eq('teamId', activity.teamId))
      .collect();

    // Create a map of participant IDs to attendance records
    const recordsMap = new Map();
    for (const record of records) {
      recordsMap.set(record.participantId, record);
    }

    // Create a combined result with all participants and their attendance status
    const result = participants.map((participant) => {
      const record = recordsMap.get(participant._id);
      return {
        participant,
        attendance: record || null,
      };
    });

    return {
      activity,
      attendanceRecords: result,
    };
  },
});

/**
 * Get attendance history for a specific participant
 * @param participantId The participant ID
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 */
export const getParticipantAttendanceHistory = query({
  args: {
    participantId: v.id('participants'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the participant
    const participant = await ctx.db.get(args.participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(participant.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to view this team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to view this participant');
    }

    // Get all attendance records for this participant
    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_participant', (q) => q.eq('participantId', args.participantId))
      .collect();

    // Get all activities to filter by date
    const activityIds = [...new Set(records.map((r) => r.activityId))];
    const activitiesPromises = activityIds.map((id) => ctx.db.get(id));
    const activities = await Promise.all(activitiesPromises);

    // Filter out nulls and create a map of activity IDs to activities
    const activitiesMap = new Map();
    for (const activity of activities) {
      if (activity) {
        activitiesMap.set(activity._id, activity);
      }
    }

    // Filter records by date range
    let filteredRecords = records;
    if (args.startDate !== undefined || args.endDate !== undefined) {
      filteredRecords = records.filter((record) => {
        const activity = activitiesMap.get(record.activityId);
        if (!activity) return false;

        if (args.startDate !== undefined && activity.date < (args.startDate as number)) {
          return false;
        }

        if (args.endDate !== undefined && activity.date > (args.endDate as number)) {
          return false;
        }

        return true;
      });
    }

    // Sort by activity date (newest first)
    filteredRecords.sort((a, b) => {
      const activityA = activitiesMap.get(a.activityId);
      const activityB = activitiesMap.get(b.activityId);

      if (!activityA && !activityB) return 0;
      if (!activityA) return 1;
      if (!activityB) return -1;

      return activityB.date - activityA.date;
    });

    // Combine the records with their activities
    const result = filteredRecords.map((record) => {
      return {
        record,
        activity: activitiesMap.get(record.activityId) || null,
      };
    });

    return {
      participant,
      attendanceHistory: result,
    };
  },
});

/**
 * List recent attendance activities across all teams
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 */
export const listRecentAttendanceActivities = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get all teams owned by the user
    const teams = await ctx.db
      .query('teams')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();

    const teamIds = teams.map((team) => team._id);
    const teamMap = new Map(teams.map((team) => [team._id.toString(), team]));

    // Skip query if no teams found
    if (teamIds.length === 0) {
      return [];
    }

    // Get all activities for all teams first
    let allActivities: AttendanceActivity[] = [];

    // Get activities team by team to avoid query chain issues
    for (const teamId of teamIds) {
      const teamActivities = await ctx.db
        .query('attendanceActivities')
        .withIndex('by_team', (q) => q.eq('teamId', teamId))
        .collect();

      allActivities = [...allActivities, ...teamActivities];
    }

    // Apply date filters in memory
    if (args.startDate !== undefined) {
      allActivities = allActivities.filter(
        (activity) => activity.date >= (args.startDate as number)
      );
    }

    if (args.endDate !== undefined) {
      allActivities = allActivities.filter((activity) => activity.date <= (args.endDate as number));
    }

    // Sort by date (newest first)
    allActivities.sort((a, b) => b.date - a.date);

    // Apply limit
    const activities = allActivities.slice(0, 20);

    // Add team name to each activity
    return activities.map((activity) => ({
      ...activity,
      teamName: teamMap.get(activity.teamId.toString())?.name || 'Unknown Team',
    }));
  },
});

/**
 * Delete an attendance activity and all associated attendance records
 * @param activityId The attendance activity ID to delete
 */
export const deleteAttendanceActivity = mutation({
  args: {
    activityId: v.id('attendanceActivities'),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getAuthUser(ctx, args);

    // Get the activity
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error('Attendance activity not found');
    }

    // Get the team to verify user has access
    const team = await ctx.db.get(activity.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify the user has permission to manage this team
    if (team.ownerId !== user._id) {
      throw new Error('Not authorized to delete attendance activities for this team');
    }

    // First delete all attendance records associated with this activity
    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_activity', (q) => q.eq('activityId', args.activityId))
      .collect();

    // Delete each record
    for (const record of records) {
      await ctx.db.delete(record._id);
    }

    // Then delete the activity itself
    await ctx.db.delete(args.activityId);

    return {
      success: true,
      deletedRecordsCount: records.length,
    };
  },
});
