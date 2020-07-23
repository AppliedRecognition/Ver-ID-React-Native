import { FaceTemplate } from './FaceTemplate';
/**
 * Represents a detected face
 */
export class Face {
  /**
   * Distance of the left edge of the face from the left edge of the image (in pixels)
   */
  x: number = 0;
  /**
   * Distance of the top edge of the face from the top edge of the image (in pixels)
   */
  y: number = 0;
  /**
   * Width of the face in the image (in pixels)
   */
  width: number = 0;
  /**
   * Height of the face in the image (in pixels)
   */
  height: number = 0;
  /**
   * Yaw of the face in relation to the camera
   */
  yaw: number = 0;
  /**
   * Pitch of the face in relation to the camera
   */
  pitch: number = 0;
  /**
   * Roll of the face in relation to the camera
   */
  roll: number = 0;
  /**
   * Quality of the face landmarks (10 maximum)
   */
  quality: number = 0;
  /**
   * Face template used for face recognition
   */
  faceTemplate: FaceTemplate = new FaceTemplate();
}
