# Ver-ID React Native

### Ver-ID face detection and recognition React Native module

## Requirements
1. [Request a License File and password](https://dev.ver-id.com/admin/register) for your app.

1. Please make sure you have installed [Yarn](https://classic.yarnpkg.com/en/docs/install/), you can check if it is installed by running the following command.
    ```
        yarn -v
    ```
   To run the iOS project, make sure to install XCODE 11.5 and Android Studio 3.5.3 for Android project.

   If you need to download this version of Android Studio, you can do it from this page: Android Studio 3.5.3.

   Note: Other versions of the applications mentioned above could work but have not been tested.

## Installation

To install the module you need to run the following command:

// Todo add installation steps using repository clone
```sh
    yarn add @appliedrec/react-native-plugin-ver-id
```

## Manual Linking to react native app

Todo add steps to link the module

##iOS
Todo add steps to link the module

## Android
Todo add steps to link the module

## Adding Ver-ID Person Plugin to Your React Native App

After installing the module the next step is to import it on your javascript file by adding the following:

``` js
    import ReactNativePluginVerId from "@appliedrec/react-native-plugin-ver-id";

    // ...

```


## Loading Ver-ID

Ver-ID must be loaded before you can run face detection sessions or compare faces.

The load operation may take up to a few of seconds. Load Ver-ID using the `load` call:

~~~javascript
ReactNativePluginVerId.load().then(verIDInstance => {
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection on verIDInstance
}).catch(error => {
    // Ver-ID failed to load
});
~~~
If you prefer, you can to specify the API password in your code instead of your app's manifest or plist:

~~~javascript
var apiPassword = "..."; // Alternative way to set your Ver-ID API Password

ReactNativePluginVerId.load(apiPassword).then(verIDInstance => {
    // Ver-ID loaded successfully
    // You can now run registration, authentication or liveness detection
}).catch(error => {
    // Ver-ID failed to load
});
~~~

## Register and Authenticate User From Javascript

The Ver-ID Person plugin module will be available in your script from the import variable `ReactNativePluginVerId`.

~~~javascript
var userId = "myUserId"; // String with an identifier for the user
var verIDInstance;

// Load Ver-ID before running registration or authentication
ReactNativePluginVerId.load().then(instance => {
    // Ver-ID loaded successfully
    verIDInstance = instance;
    // Run a registration session
    var settings = new ReactNativePluginVerId.RegistrationSessionSettings(userId);
    settings.showResult = true; // If you wish the plugin to show the result of the session to the user
    return verIDInstance.register(settings);
}).then(response => {
    if (!response) {
	// User cancelled the registration
	return;
    }
    if (!response.error) {
        // User registered
        // Run an authentication session
        var settings = new ReactNativePluginVerId.AuthenticationSessionSettings(userId);
        settings.showResult = true; // If you wish the plugin to show the result of the session to the user
        return verIDInstance.authenticate(settings);
    } else {
        return response;
    }
}).then(response => {
    if (!response) {
        // User cancelled the registration
    } else if (!response.error) {
        // User authenticated
    } else {
        // Session failed
    }
}).catch(error => {
    // Handle the failure
});
~~~

## Liveness Detection

In a liveness detection session the user is asked to assume a series of random poses in front of the camera.

Liveness detection sessions follow the same format as registration and authentication.

### Extracting faces for face comparison
~~~javascript
// Load Ver-ID before running liveness detection
ReactNativePluginVerId.load().then(verIDInstance => {
    // Ver-ID loaded successfully
    // Run a liveness detection session
    var settings = ReactNativePluginVerId.LivenessDetectionSessionSettings();
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    if (!response) {
	// Session was cancelled
    } else if (!response.error) {
        // Session finished
        var faces = response.attachments.filter(attachment => {
	        // Only get faces that are looking straight at the camera and have recognition data
	        return attachment.bearing == verid.Bearing.STRAIGHT && attachment.recognizableFace.faceTemplate;
        }).map(face => {
            return attachment.face;
        });
        // You can use the above faces to compare the detected face to faces from other sessions (see Comparing Faces section below)
    } else {
    	// Session failed
    }
}).catch(error => {
    // Handle the failure
});
~~~

### Face detection session without asking for poses
~~~javascript
// Load Ver-ID before running liveness detection
ReactNativePluginVerId.load().then(verIDInstance => {
    // Ver-ID loaded successfully
    // Run a liveness detection session
    var settings = ReactNativePluginVerId.LivenessDetectionSessionSettings();
    // We only want to collect one result
    settings.numberOfResultsToCollect = 1;
    // Ask the user to assume only one bearing (straight)
    settings.bearings = [verid.Bearing.STRAIGHT];
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    // Session finished
}).catch(error => {
    // Handle the failure
});
~~~

### Liveness detection session defining the bearings (poses) the user may be asked to assume
~~~javascript
// Load Ver-ID before running liveness detection
ReactNativePluginVerId.load().then(verIDInstance => {
    // Ver-ID loaded successfully
    // Run a liveness detection session
    var settings = ReactNativePluginVerId.LivenessDetectionSessionSettings();
    // The user will be asked to look straight at the camera and then either left or right
    settings.bearings = [verid.Bearing.STRAIGHT, verid.Bearing.LEFT, verid.Bearing.RIGHT];
    return verIDInstance.captureLiveFace(settings);
}).then(response => {
    // Session finished
}).catch(error => {
    // Handle the failure
});
~~~

## Session Response Format

The callback of a successful session will contain [an object](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.sessionresult.html) that represents the result of the session.

## Comparing Faces

After collecting two faces as outlined in the Liveness Detection section above run:

~~~javascript
ReactNativePluginVerId.load().then(verIDInstance => {
    return verIDInstance.compareFaces(face1, face2);
}).then(result => {
    // result.score = Similarity score between the two faces
    // result.authenticationThreshold = Threshold beyond which faces may be considered similar enough for the user to be authenticated
    // result.max = Maximum possible score
}).catch(error => {
    // Handle the failure
});
~~~

## Detecting Faces In Images

As of version 4.1.0 the API lets your app detect a face in an image it supplies. The image must be supplied using [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme).

See the [`Face`](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.face.html) type documentation for the properties of the returned face. You can pass the faces to the [`compareFaces `](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/classes/_ver_id_.verid.html#comparefaces) function.

~~~javascript
// imageBase64Data is an image in base64 format
ReactNativePluginVerId.load().then(verIDInstance => {
        return verIDInstance.detectFaceInImage(imageBase64Data);
    }).then(face => {
        // Face detected
    }).catch(error => {
        // Face detection failed
    });
~~~

## Module API Reference

 - [Ver-ID](https://appliedrecognition.github.io/Ver-ID-Person-Cordova-Plugin/modules/_ver_id_.html)
