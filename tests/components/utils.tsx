import React from 'react';
import { View, TouchableHighlight, Alert, Text, StyleSheet } from 'react-native';

var styles = StyleSheet.create(require('./component_styles'));

export const createButton = (text: string, onPress: Function, key: number) => {
    return (
        <View style={styles.container} key={key}>
            <TouchableHighlight onPress={() => onPress()} style={styles.button}>
                <Text style={styles.buttonText}>{text}</Text>
            </TouchableHighlight>
        </View>
    );
};

export const alert = (
    title: string,
    description: string,
    callbacks?: { successCallback?: Function; cancelCallback?: Function }
) => {
    let options: Array<any> = [
        {
            text: !callbacks || (callbacks && !callbacks.successCallback) ? 'Close' : 'Cancel',
            onPress: () =>
                callbacks && callbacks.cancelCallback ? callbacks.cancelCallback() : console.log('Canceled!'),
            style: callbacks ? {} : 'cancel',
        },
    ];
    if (callbacks && callbacks.successCallback) {
        options.push({
            text: 'OK',
            onPress: () => {
                if (typeof callbacks.successCallback === 'function') callbacks.successCallback();
            },
        });
    }

    Alert.alert(title, description, options, { cancelable: true });
};

export const showErrorAlert = (message: string, error?: any) => {
    alert('Error', 'Error Found: ' + message);
    if (error) {
        console.error('Error:', error);
    }
};

export const showSuccessAlert = (description: any) => {
    return new Promise<any>((resolve, reject) => {
        alert('Success', description, { successCallback: resolve, cancelCallback: reject });
    });
};

export const errorhandler = (error: any) => {
    console.error(error);
};
