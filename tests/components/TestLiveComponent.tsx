'use strict';
import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ReactNativePluginVerId from '../../src/imports';
import type { VerID } from '../../src/classes/VerID';
import { createButton, showErrorAlert, showSuccessAlert, errorhandler } from './utils';
import {
    registerUser,
    captureLiveFace,
    deleteRegisteredUser,
    compareFaces,
    detectFaceInImage,
    authenticate,
} from '../LiveTests';
import type { Face } from '../../src/Ver-ID';

type initialState = {
    instance?: VerID;
    USER_ID: string;
};

var styles = StyleSheet.create(require('./component_styles'));

class TestLiveComponent extends Component<{}, initialState> {
    constructor(props: any) {
        super(props);
        this.state = { instance: undefined, USER_ID: 'USER_ID' };
    }

    instanceExist = () => {
        return this.state.instance;
    };

    getInstance = async () => {
        if (!this.instanceExist()) {
            let instance = await ReactNativePluginVerId.load();
            this.setState({ instance: instance });
            return instance;
        } else {
            return this.state.instance;
        }
    };

    registerUser = async (showResult?: boolean) => {
        let instance = await this.getInstance();
        if (instance) {
            registerUser(instance, this.state.USER_ID, showResult)
                .catch(errorhandler)
                .finally(deleteRegisteredUser.bind(this, instance, this.state.USER_ID));
        } else {
            showErrorAlert('Error, getting the instance');
        }
    };

    registerUserAuthenticate = async () => {
        let instance = await this.getInstance();
        if (instance) {
            registerUser(instance, this.state.USER_ID)
                .then(authenticate.bind(this, instance, this.state.USER_ID))
                .catch(errorhandler)
                .finally(deleteRegisteredUser.bind(this, instance, this.state.USER_ID));
        } else {
            showErrorAlert('Error, getting the instance');
        }
    };

    captureLiveFaceAndCompare = async () => {
        let instance = await this.getInstance();
        if (instance) {
            var faces: any[];
            captureLiveFace(instance)
                .then((facesResult) => {
                    if (!facesResult) {
                        showErrorAlert('session canceled!');
                        return;
                    }

                    faces = facesResult;
                    return showSuccessAlert('Faces captured!, continue with single pose face capturing? ');
                })
                .then(captureLiveFace.bind(this, instance, true))
                .then((facesResult) => {
                    if (!facesResult) {
                        showErrorAlert('session canceled!');
                        return;
                    }

                    faces = facesResult;
                    return showSuccessAlert('Faces captured!, continue with faces comparison?').then(() => {
                        if (instance) return compareFaces(instance, faces[0], facesResult[0]);
                        return;
                    });
                })
                .catch(errorhandler);
        }
    };

    detectFaceInSample = async () => {
        let instance = await this.getInstance();
        if (instance) {
            var face1: Face;
            captureLiveFace(instance)
                .then((facesResult) => {
                    if (!facesResult) {
                        showErrorAlert('session canceled!');
                        return;
                    }

                    face1 = facesResult[0];
                    return showSuccessAlert('Faces captured!, continue with Detect Face In Image? ');
                })
                .then(detectFaceInImage.bind(this, instance))
                .then((face2) => {
                    if (!face2) {
                        showErrorAlert('Error! Face not returned.');
                        return;
                    }
                    return showSuccessAlert('Faces captured!, continue with faces comparison?').then(() => {
                        if (instance) return compareFaces(instance, face1, face2);
                        return;
                    });
                })
                .catch(errorhandler);
        }
    };

    mapActions = () => {
        let actions: Array<any> = [
            { title: 'register User', action: this.registerUser },
            { title: 'Register user Show result', action: this.registerUser.bind(this, true) },
            { title: 'Register user and Authenticate', action: this.registerUserAuthenticate },
            { title: 'Capture Live Face and compare', action: this.captureLiveFaceAndCompare },
            { title: 'Detect Face in Sample Image and compare', action: this.detectFaceInSample },
        ];

        return actions;
    };

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    {this.mapActions().map((action: any, index: number) => {
                        return createButton(action.title, action.action, index);
                    })}
                </ScrollView>
            </View>
        );
    }
}

export default TestLiveComponent;
