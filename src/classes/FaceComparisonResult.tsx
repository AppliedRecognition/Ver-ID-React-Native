/**
 * Result of a face comparison
 */
export class FaceComparisonResult {
  /**
   * The result score
   */
  score: number = 0;
  /**
   * Comparisons with scores higher than the threshold may be considered authenticated
   */
  authenticationThreshold: number = 0;
  /**
   * Maximum possible score
   */
  max: number = 0;
}
