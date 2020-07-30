import type { VerID } from '../src/classes/VerID';
import ReactNativePluginVerId from '@appliedrec/react-native-plugin-ver-id';
import { showErrorAlert, showSuccessAlert } from './components/utils';
import type { Face } from '../src/classes/Face';
import type { FaceTemplate } from '../src/classes/FaceTemplate';

type Attachment = {
    recognizableFace: Face;
    bearing: string;
    image: string;
};

const validateProperty = (object: any, property: string, expectedType: string) => {
    let isValid =
        expectedType === 'array' && object
            ? Array.isArray(object[property])
            : object && object[property] && typeof object[property] === expectedType;

    if (!isValid) {
        console.warn(
            'is property valid?, property:',
            Object.keys(object)[0],
            'valid:',
            isValid,
            'value:',
            object[property]
        );
    }
    return isValid;
};

const verifyIfAttachmentIsCorrect = (attachment: Attachment) => {
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

    if (instance) {
        return instance
            .register(settings)
            .then((response: any) => {
                if (!response) {
                    showErrorAlert('Registration Canceled');
                    return;
                }
                if (!response.error) {
                    showSuccessAlert('Registration Completed!');
                } else {
                    showErrorAlert('Error capturing Face!', response.error);
                }
                return response;
            })
            .catch((error: any) => {
                showErrorAlert('Register, unknown error!', error);
            });
    }
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
                            .filter((attachment: Attachment) => {
                                return (
                                    verifyIfAttachmentIsCorrect(attachment) &&
                                    attachment.bearing === ReactNativePluginVerId.Bearing.STRAIGHT
                                );
                            })
                            .map((attachment: Attachment) => {
                                return attachment.recognizableFace;
                            });
                        showSuccessAlert('Faces attachment are correct!');
                        return faces;
                    } else {
                        showErrorAlert('Error retrieving the faces!', response.error);
                    }
                } else {
                    showErrorAlert('Session Error, error capturing face!', response.error);
                }
                return response;
            })
            .catch((error) => {
                showErrorAlert('Capture Live Face, unknown error!', error);
            });
    }
};
