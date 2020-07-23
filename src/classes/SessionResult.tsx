import type { DetectedFace } from './DetectedFace';
/**
 * Result of a Ver-ID session
 */
export class SessionResult {
  /**
   * Faces and images detected during a session
   */
  attachments: DetectedFace[] = [];
  /**
   * Error (if any) that caused the session to fail
   */
  error?: Error;
}
