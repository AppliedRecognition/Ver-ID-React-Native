import type { RegistrationSessionSettings } from './RegistrationSessionSettings';
import type { AuthenticationSessionSettings } from './AuthenticationSessionSettings';
import type { LivenessDetectionSessionSettings } from './LivenessDetectionSessionSettings';
import type { Face } from './Face';
import type { FaceComparisonResult } from './FaceComparisonResult';
import type { SessionResult } from './SessionResult';
import { NativeModules } from 'react-native';
const { ReactNativePluginVerId } = NativeModules;

export const PluginVerId = ReactNativePluginVerId;

export class VerID {
  /**
   * Register faces for user
   * @param settings Session settings
   */
  register(settings: RegistrationSessionSettings): Promise<SessionResult> {
    return new Promise<SessionResult>((resolve, reject) => {
      PluginVerId.registerUser(JSON.stringify(settings))
        .then(decodeResult(resolve))
        .catch(reject);
    });
  }

  /**
   * Authenticate user
   * @param settings Session settings
   */
  authenticate(
    settings: AuthenticationSessionSettings
  ): Promise<SessionResult> {
    return new Promise<SessionResult>((resolve, reject) => {
      PluginVerId.authenticate(JSON.stringify(settings))
        .then(decodeResult(resolve))
        .catch(reject);
    });
  }

  /**
   * Capture a live face
   * @param settings Session settings
   */
  captureLiveFace(
    settings: LivenessDetectionSessionSettings
  ): Promise<SessionResult> {
    return new Promise<SessionResult>((resolve, reject) => {
      PluginVerId.captureLiveFace(JSON.stringify(settings))
        .then(decodeResult(resolve))
        .catch(reject);
    });
  }

  /**
   * Get an array of users with registered faces
   */
  getRegisteredUsers(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      PluginVerId.getRegisteredUsers()
        .then(decodeResult(resolve))
        .catch(reject);
    });
  }

  /**
   * Delete user with registered faces
   * @param userId ID of the user to delete
   */
  deleteRegisteredUser(userId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      PluginVerId.deleteUser(userId).then(decodeResult(resolve)).catch(reject);
    });
  }

  /**
   * Compare faces and return a result
   * @param face1 Face to compare to the other face
   * @param face2 Other face to compare to the first face
   */
  compareFaces(face1: Face, face2: Face): Promise<FaceComparisonResult> {
    return new Promise<FaceComparisonResult>((resolve, reject) => {
      PluginVerId.compareFaces(JSON.stringify(face1), JSON.stringify(face2))
        .then(decodeResult(resolve))
        .catch(reject);
    });
  }

  /**
   * Detect a face in image
   * @param image [Data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme) encoded image in which to detect a face
   */
  detectFaceInImage(image: string): Promise<Face> {
    return new Promise<Face>((resolve, reject) => {
      function callback(encoded: string) {
        if (encoded == null) {
          return reject('Face not found');
        }
        return resolve(JSON.parse(encoded));
      }

      PluginVerId.detectFaceInImage(image).then(callback).catch(reject);
    });
  }
}

export function decodeResult<T>(callback: (result?: T) => void) {
  return (encoded?: string) => {
    if (encoded) {
      if (typeof encoded === 'string') {
        var decoded = JSON.parse(encoded);
        callback(decoded);
      } else {
        callback(encoded);
      }
    } else {
      callback();
    }
  };
}
