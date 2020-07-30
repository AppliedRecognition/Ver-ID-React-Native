/* eslint-env jasmine */
'use strict';
import type * as verId from '../src/Ver-ID';
import type { VerID } from '../src/classes/VerID';
import { EMPTY_IMAGE, FACE_TEST_DATA, FACE_TEST_IMAGE } from './fixtures/face';

const USER_ID = 'USER_ID';

export default function (VerIDPlugin: typeof verId) {
    describe('Ver Id plugin (ReactNativePluginVerid)', function () {
        it('1. should exist', function () {
            expect(VerIDPlugin).toBeDefined();
        });

        it(
            '2. VerIDPlugin should contain the following functions: load, unload, AuthenticationSessionSettings' +
                'DetectedFace, Error, Face, FaceComparisonResult, FaceTemplate, LivenessDetectionSessionSettings' +
                'RegistrationSessionSettings, SessionResult, VerIDSessionSettings',
            function () {
                expect(VerIDPlugin.load).toBeDefined();
                expect(typeof VerIDPlugin.load).toBe('function');
                expect(typeof VerIDPlugin.unload).toBe('function');
                expect(typeof VerIDPlugin.AuthenticationSessionSettings).toBe('function');
                expect(typeof VerIDPlugin.DetectedFace).toBe('function');
                expect(typeof VerIDPlugin.Error).toBe('function');
                expect(typeof VerIDPlugin.Face).toBe('function');
                expect(typeof VerIDPlugin.FaceComparisonResult).toBe('function');
                expect(typeof VerIDPlugin.FaceTemplate).toBe('function');
                expect(typeof VerIDPlugin.LivenessDetectionSessionSettings).toBe('function');
                expect(typeof VerIDPlugin.RegistrationSessionSettings).toBe('function');
                expect(typeof VerIDPlugin.SessionResult).toBe('function');
                expect(typeof VerIDPlugin.VerIDSessionSettings).toBe('function');
            }
        );
    });
    describe('testing of load and unload functions', function () {
        it(
            '3. load then function should return an object with the following functions =' +
                'authenticate, captureLiveFace, compareFaces, deleteRegisteredUser, detectFaceInImage, getRegisteredUsers, register',
            function (done) {
                VerIDPlugin.load()
                    .then((instance: any) => {
                        expect(typeof instance).toBe('object');
                        expect(typeof instance.authenticate).toBe('function');
                        expect(typeof instance.captureLiveFace).toBe('function');
                        expect(typeof instance.compareFaces).toBe('function');
                        expect(typeof instance.deleteRegisteredUser).toBe('function');
                        expect(typeof instance.detectFaceInImage).toBe('function');
                        expect(typeof instance.getRegisteredUsers).toBe('function');
                        expect(typeof instance.register).toBe('function');
                    })
                    .catch((error: any) => {
                        //force test to fail
                        console.error('Error on test #3:', error);
                        expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                    })
                    .finally(() => {
                        VerIDPlugin.unload();
                        done();
                    });
            }
        );

        it('4. instance exist If unload not called', function (done) {
            VerIDPlugin.load()
                .then(() => {
                    return VerIDPlugin.load();
                })
                .then((instance: any) => {
                    //instance should exist if unload was no called
                    expect(typeof instance).toBe('object');
                })
                .catch((error: any) => {
                    //force test to fail
                    console.error('Error on test #4:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });

        it('5. unload should return a promise', function (done) {
            VerIDPlugin.load()
                .then(() => {
                    return VerIDPlugin.unload();
                })
                .then((resp: any) => {
                    expect(resp).toBeDefined();
                    expect(typeof resp).toBe('string');
                })
                .catch((error: any) => {
                    //force test to fail
                    console.error('Error on test #5:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('testing of settings', function () {
        it('6. test LivenessDetectionSessionSettings', function () {
            let settings = new VerIDPlugin.LivenessDetectionSessionSettings();
            expect(typeof settings).toBe('object');
            expect(settings.bearings).toBeDefined();
            expect(Array.isArray(settings.bearings)).toBe(true);
            expect(settings.bearings.length).toBe(5);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
        });
        it('7. test AuthenticationSessionSettings', function () {
            let settings = new VerIDPlugin.AuthenticationSessionSettings(USER_ID);
            expect(typeof settings).toBe('object');
            expect(settings.bearings).toBeDefined();
            expect(Array.isArray(settings.bearings)).toBe(true);
            expect(settings.bearings.length).toBe(5);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
            expect(settings.userId).toBeDefined();
            expect(settings.userId).toBe(USER_ID);
        });
        it('8. test RegistrationSessionSettings', function () {
            let settings = new VerIDPlugin.RegistrationSessionSettings(USER_ID);
            expect(typeof settings).toBe('object');
            expect(settings.bearingsToRegister).toBeDefined();
            expect(Array.isArray(settings.bearingsToRegister)).toBe(true);
            expect(settings.bearingsToRegister.length).toBe(3);
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(1);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
            expect(settings.userId).toBeDefined();
            expect(settings.userId).toBe(USER_ID);
        });

        it('9. test VerIDSessionSettings', function () {
            let settings = new VerIDPlugin.VerIDSessionSettings();
            expect(typeof settings).toBe('object');
            expect(settings.expiryTime).toBeDefined();
            expect(settings.expiryTime).toBe(30);
            expect(settings.numberOfResultsToCollect).toBeDefined();
            expect(settings.numberOfResultsToCollect).toBe(2);
            expect(settings.showResult).toBeDefined();
            expect(settings.showResult).toBe(false);
        });
    });
    describe('testing of detectFaceInImage', function () {
        it('10. test detectFaceInImage with image that has a face', function (done) {
            VerIDPlugin.load()
                .then((verIDInstance) => {
                    return verIDInstance.detectFaceInImage(FACE_TEST_IMAGE);
                })
                .then((face) => {
                    expect(face).toBeDefined();
                    expect(typeof face).toBe('object');
                    expect(typeof face.data).toBe('string');
                    expect(typeof face.faceTemplate).toBe('object');
                    expect(typeof face.height).toBe('number');
                    expect(Array.isArray(face.leftEye)).toBe(true);
                    expect(Array.isArray(face.rightEye)).toBe(true);
                    expect(typeof face.pitch).toBe('number');
                    expect(typeof face.roll).toBe('number');
                    expect(typeof face.width).toBe('number');
                    expect(typeof face.x).toBe('number');
                    expect(typeof face.y).toBe('number');
                    expect(typeof face.yaw).toBe('number');
                })
                .catch((error) => {
                    //force test to fail
                    console.error('Error on test #10:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });
        it('11. test detectFaceInImage with image that does not have a face', function (done) {
            VerIDPlugin.load()
                .then((verIDInstance) => {
                    return verIDInstance.detectFaceInImage(EMPTY_IMAGE);
                })
                .catch((error) => {
                    //Not face detected or Error found
                    console.log('Error expected on test #11:', error);
                    expect(error).toBeDefined();
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });
    });
    describe('testing of compareFaces', function () {
        it('12. test compareFaces with face from image and mockup', function (done) {
            let instance: VerID;
            VerIDPlugin.load()
                .then((verIDInstance) => {
                    instance = verIDInstance;
                    return verIDInstance.detectFaceInImage(FACE_TEST_IMAGE);
                })
                .then((face) => {
                    return instance.compareFaces(face, FACE_TEST_DATA);
                })
                .then((result) => {
                    expect(result).toBeDefined();
                    expect(typeof result.score).toBe('number');
                    expect(typeof result.authenticationThreshold).toBe('number');
                    expect(typeof result.max).toBe('number');
                })
                .catch((error) => {
                    //force test to fail
                    console.error('Error on test #12:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });
    });
    describe('testing of deleteRegisterUser', function () {
        it('13. test deleteRegisterUser with any param value', function (done) {
            VerIDPlugin.load()
                .then((instance) => {
                    return instance.deleteRegisteredUser('test');
                })
                .then((resp) => {
                    expect(typeof resp).toBe('string');
                })
                .catch((error) => {
                    //force test to fail
                    console.error('Error on test #13:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });
    });
    describe('testing of register using mocks', function () {
        it('14. test register user', function (done) {
            let settings = new VerIDPlugin.RegistrationSessionSettings(USER_ID);

            VerIDPlugin.setTestingMode(true).then(() => {
                VerIDPlugin.load()
                    .then((verIDInstance) => {
                        return verIDInstance.register(settings);
                    })
                    .then((response) => {
                        expect(response).toBeDefined();
                        expect(Array.isArray(response.attachments)).toBe(true);
                        expect(response.attachments.length).toBe(1);
                        expect(typeof response.attachments[0].recognizableFace).toBe('object');
                        expect(typeof response.attachments[0].bearing).toBe('string');
                        expect(typeof response.attachments[0].image).toBe('string');
                    })
                    .catch((error) => {
                        //force test to fail
                        console.error('Error on test #14:', error);
                        expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                    })
                    .finally(() => {
                        VerIDPlugin.unload();
                        VerIDPlugin.setTestingMode(false);
                        done();
                    });
            });
        });
    });
    describe('testing of authenticate using mocks', function () {
        it('15. test authenticate user', function (done) {
            VerIDPlugin.setTestingMode(true).then(() => {
                VerIDPlugin.load()
                    .then((verIDInstance) => {
                        return verIDInstance.authenticate(
                            new VerIDPlugin.AuthenticationSessionSettings(USER_ID)
                        );
                    })
                    .then((response) => {
                        expect(response).toBeDefined();
                        expect(Array.isArray(response.attachments)).toBe(true);
                        expect(response.attachments.length).toBe(1);
                        expect(typeof response.attachments[0].recognizableFace).toBe('object');
                        expect(typeof response.attachments[0].bearing).toBe('string');
                        expect(typeof response.attachments[0].image).toBe('string');
                    })
                    .catch((error) => {
                        //force test to fail
                        console.error('Error on test #15:', error);
                        expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                    })
                    .finally(() => {
                        VerIDPlugin.unload();
                        VerIDPlugin.setTestingMode(false);
                        done();
                    });
            });
        });
    });
    describe('testing of captureLiveFace using mocks', function () {
        it('16. test captureLiveFace', function (done) {
            VerIDPlugin.setTestingMode(true).then(() => {
                VerIDPlugin.load()
                    .then((verIDInstance) => {
                        return verIDInstance.captureLiveFace(
                            new VerIDPlugin.LivenessDetectionSessionSettings()
                        );
                    })
                    .then((response) => {
                        expect(response).toBeDefined();
                        expect(Array.isArray(response.attachments)).toBe(true);
                        expect(response.attachments.length).toBe(1);
                        expect(typeof response.attachments[0].recognizableFace).toBe('object');
                        expect(typeof response.attachments[0].bearing).toBe('string');
                        expect(typeof response.attachments[0].image).toBe('string');
                    })
                    .catch((error) => {
                        //force test to fail
                        console.error('Error on test #16:', error);
                        expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                    })
                    .finally(() => {
                        VerIDPlugin.unload();
                        VerIDPlugin.setTestingMode(false);
                        done();
                    });
            });
        });
    });
    describe('testing of getRegisteredUsers', function () {
        it('17. test getRegisteredUsers without testing mode', function (done) {
            VerIDPlugin.load()
                .then((instance) => {
                    return instance.getRegisteredUsers();
                })
                .then((users) => {
                    expect(users).toBeDefined();
                    expect(Array.isArray(users)).toBe(true);
                    expect(users.length).toBe(0);
                })
                .catch((error) => {
                    //force test to fail
                    console.error('Error on test #17:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.unload();
                    done();
                });
        });
        it('18. test getRegisteredUsers without testing mode on', function (done) {
            VerIDPlugin.setTestingMode(true)
                .then(() => {
                    return VerIDPlugin.load();
                })
                .then((instance) => {
                    return instance.getRegisteredUsers();
                })
                .then((users) => {
                    expect(Array.isArray(users)).toBe(true);
                    expect(users.length).toBe(3);
                })
                .catch((error) => {
                    //force test to fail
                    console.error('Error on test #18:', error);
                    expect('AUTHENTICATION FAILED OR ERROR FOUND').toBe('false');
                })
                .finally(() => {
                    VerIDPlugin.setTestingMode(false);
                    VerIDPlugin.unload();
                    done();
                });
        });
    });
}
