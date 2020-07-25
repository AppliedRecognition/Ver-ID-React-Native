/* eslint-env jasmine */
'use strict';

type VerIdPluginSpec = {
    load: Function;
    unload: Function;
    AuthenticationSessionSettings: Function;
    Error: Function;
    Face: Function;
    FaceComparisonResult: Function;
    FaceTemplate: Function;
    LivenessDetectionSessionSettings: Function;
    RegistrationSessionSettings: Function;
    DetectedFace: Function;
    SessionResult: Function;
    VerIDSessionSettings: Function;
};

export default function (VerIDPlugin: VerIdPluginSpec) {
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
    describe('Ver Id plugin, testing of load and unload functions', function () {
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
}
