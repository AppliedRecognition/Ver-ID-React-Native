import { VerIDSessionSettings } from './VerIDSessionSettings';
import { Bearing } from './enums';
/**
 * Settings for liveness detection sessions
 */
export class LivenessDetectionSessionSettings extends VerIDSessionSettings {
  /**
   * Default pool of bearings the session will draw from when asking for a random pose
   */
  static DEFAULT_BEARINGS: Bearing[] = [
    Bearing.STRAIGHT,
    Bearing.LEFT,
    Bearing.LEFT_UP,
    Bearing.RIGHT_UP,
    Bearing.RIGHT,
  ];

  /**
   * The bearings the session will draw from when asking for a random pose
   */
  bearings: Bearing[] = LivenessDetectionSessionSettings.DEFAULT_BEARINGS;
}
