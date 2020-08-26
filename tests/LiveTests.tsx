import type { VerID } from '../src/classes/VerID';
import ReactNativePluginVerId from '@appliedrec/react-native-plugin-ver-id';
import { showErrorAlert, showSuccessAlert } from './components/utils';
import type { Face } from '../src/classes/Face';
import type { FaceTemplate } from '../src/classes/FaceTemplate';
import type { DetectedFace } from '../src/classes/DetectedFace';
import { FACE_TEST_IMAGE } from './fixtures/face';
import type { FaceComparisonResult, SessionResult } from '../src/Ver-ID';

const validateProperty = (object: any, property: string, expectedType: string) => {
    let isValid =
        expectedType === 'array' && object
            ? Array.isArray(object[property])
            : object && object[property] && typeof object[property] === expectedType;

    if (!isValid) {
        console.warn(
            'is property valid?, property:',
            property,
            'valid:',
            isValid,
            'value:',
            object[property]
        );
    }
    return isValid;
};

const verifyIfAttachmentIsCorrect = (attachment: DetectedFace) => {
    let isValid =
        attachment &&
        validateProperty(attachment, 'recognizableFace', 'object') &&
        verifyIfFaceIsCorrect(attachment.recognizableFace) &&
        validateProperty(attachment, 'bearing', 'string') &&
        validateProperty(attachment, 'image', 'string');

    if (!isValid) console.warn('Is Attachment Valid?', isValid);
    return isValid;
};

const verifyIfFaceIsCorrect = (face: Face) => {
    let isValid =
        face &&
        validateProperty(face, 'height', 'number') &&
        validateProperty(face, 'width', 'number') &&
        validateProperty(face, 'pitch', 'number') &&
        validateProperty(face, 'x', 'number') &&
        validateProperty(face, 'y', 'number') &&
        validateProperty(face, 'roll', 'number') &&
        validateProperty(face, 'quality', 'number') &&
        validateProperty(face, 'rightEye', 'array') &&
        validateProperty(face, 'faceTemplate', 'object') &&
        verifyIfFaceTemplateIsCorrect(face.faceTemplate) &&
        validateProperty(face, 'yaw', 'number');

    if (!isValid) console.warn('Is Face Valid?', isValid);
    return isValid;
};

const verifyIfFaceTemplateIsCorrect = (faceTemplate: FaceTemplate) => {
    let isValid =
        faceTemplate &&
        validateProperty(faceTemplate, 'data', 'string') &&
        validateProperty(faceTemplate, 'version', 'number');

    if (!isValid) console.warn('Is FaceTemplate Valid?', isValid);
    return isValid;
};

export const registerUser = async (instance: VerID, userID: string, showResult?: boolean) => {
    var settings = new ReactNativePluginVerId.RegistrationSessionSettings(userID);
    settings.showResult = showResult ? showResult : false;

    return new Promise<SessionResult | void>((resolve, reject) => {
        if (instance) {
            instance
                .register(settings)
                .then((response: any) => {
                    if (!response) {
                        throw new Error('Registration Canceled');
                    }
                    if (!response.error) {
                        showSuccessAlert('Registration Completed!').then(() => {
                            resolve(response);
                        });
                    } else {
                        showErrorAlert('Error capturing Face!', response.error);
                        reject(response.error);
                    }
                })
                .catch((error: any) => {
                    showErrorAlert('Register, unknown error!', error);
                    reject(error);
                });
        } else {
            reject('Instance not found!');
        }
    });
};

export const authenticate = async (instance: VerID, userID: string) => {
    return new Promise<SessionResult | void>((resolve, reject) => {
        if (instance) {
            var settings = new ReactNativePluginVerId.AuthenticationSessionSettings(userID);
            instance
                .authenticate(settings)
                .then((response) => {
                    if (!response) {
                        throw new Error('Authentication Canceled');
                    }
                    if (!response.error) {
                        showSuccessAlert('Authentication Completed!').then(() => {
                            resolve(response);
                        });
                    } else {
                        showErrorAlert('Error capturing Face!', response.error);
                        reject(response.error);
                    }
                })
                .catch((error) => {
                    showErrorAlert('Authenticate, unknown error!', error);
                    reject(error);
                });
        } else {
            reject('Instance not found!');
        }
    });
};

export const captureLiveFace = async (instance: VerID, singlePose?: boolean, showResult?: boolean) => {
    var settings = new ReactNativePluginVerId.LivenessDetectionSessionSettings();

    if (singlePose) {
        settings.numberOfResultsToCollect = 1;
        settings.bearings = [ReactNativePluginVerId.Bearing.STRAIGHT];
    }

    settings.showResult = showResult ? showResult : false;

    if (instance) {
        return instance
            .captureLiveFace(settings)
            .then((response: any) => {
                if (!response) {
                    showErrorAlert('Session Canceled!');
                    return;
                } else if (!response.error) {
                    if (response.attachments.length > 0) {
                        let faces = response.attachments
                            .filter((attachment: DetectedFace) => {
                                return (
                                    verifyIfAttachmentIsCorrect(attachment) &&
                                    attachment.bearing === ReactNativePluginVerId.Bearing.STRAIGHT
                                );
                            })
                            .map((attachment: DetectedFace) => {
                                return attachment.recognizableFace;
                            });
                        return showSuccessAlert('Faces attachment are correct!').then(() => {
                            return faces;
                        });
                    } else {
                        showErrorAlert('Error retrieving the faces!', response.error);
                        throw new Error('Error retrieving the faces!');
                    }
                } else {
                    showErrorAlert('Session Error, error capturing face!', response.error);
                    throw new Error('Session Error, error capturing face!');
                }
            })
            .catch((error) => {
                showErrorAlert('Capture Live Face, unknown error!', error);
                throw error;
            });
    }
};

export const compareFaces = async (instance: VerID, Face1: Face, Face2: Face) => {
    return new Promise<FaceComparisonResult | void>((resolve, reject) => {
        if (instance) {
            instance
                .compareFaces(Face1, Face2)
                .then((result) => {
                    if (!result) {
                        throw new Error('No result obtained!');
                    }
                    console.log(result);
                    showSuccessAlert(`Result Obtained: ${JSON.stringify(result)}`).then(() => {
                        resolve(result);
                    });
                })
                .catch((error) => {
                    showErrorAlert('Compare Faces, unknown error!', error);
                    reject(error);
                });
        } else {
            reject('Instance not found!');
        }
    });
};

export const detectFaceInImage = async (instance: VerID) => {
    if (instance) {
        return instance
            .detectFaceInImage(FACE_TEST_IMAGE)
            .then((face: any) => {
                if (!face) {
                    throw new Error('Error getting result!');
                }
                if (!verifyIfFaceIsCorrect(face)) {
                    throw new Error('Face object is not valid!');
                }
                return face;
            })
            .catch((error) => {
                showErrorAlert('Detect Face in Image, unknown error!', error);
                throw error;
            });
    }
};

export const deleteRegisteredUser = async (instance: VerID, userID: string) => {
    if (instance) {
        return instance
            .deleteRegisteredUser(userID)
            .then((response: any) => {
                if (!response.error) {
                    showSuccessAlert(`Delete of ${userID} Completed!`);
                } else {
                    showErrorAlert('Error deleting user!', response.error);
                    throw new Error('Error deleting user!');
                }
            })
            .catch((error: any) => {
                showErrorAlert('Delete User, unknown error!', error);
                throw error;
            });
    } else {
        showErrorAlert('Error, instance not found!');
        throw new Error('Error, instance not found!');
    }
};
