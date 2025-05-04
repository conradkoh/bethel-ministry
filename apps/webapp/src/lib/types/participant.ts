import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import type { Participant as ConvexParticipant } from '@workspace/backend/convex/participants/queries';

/**
 * Participant interface representing a participant in the system
 * Maps to the participants table in the database
 */
export interface Participant extends Omit<ConvexParticipant, '_creationTime'> {
  _creationTime?: number;
}

/**
 * ParticipantFormData interface for participant creation/editing forms
 */
export interface ParticipantFormData {
  name: string;
  joinDate: number;
  teamId: Id<'teams'>;
}
