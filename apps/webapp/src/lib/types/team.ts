import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import type { TeamHierarchy } from '@workspace/backend/convex/teams';

/**
 * Team interface representing a team in the system
 * Maps to the teams table in the database
 */
export interface Team {
  _id: Id<'teams'>;
  _creationTime: number;
  name: string;
  timezone: string;
  ownerId: Id<'users'>;
  parentId?: Id<'teams'>;
  path: string; // Hierarchical path string (format: /id1/id2/id3/)
  createdAt: number;
  updatedAt: number;
}

// Re-export TeamHierarchy for use in frontend components
export type { TeamHierarchy };

/**
 * TeamFormData interface for team creation/editing forms
 */
export interface TeamFormData {
  name: string;
  timezone: string;
  parentId?: Id<'teams'> | null;
}

/**
 * Timezone option for dropdown selection
 */
export interface TimezoneOption {
  value: string;
  label: string;
}

/**
 * Common timezone options
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
];
