package com.appliedrecreactnativepluginverid

import android.app.Activity
import android.content.Intent
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Base64InputStream
import androidx.exifinterface.media.ExifInterface
import com.appliedrec.verid.core2.*
import com.appliedrec.verid.core2.session.*
import com.appliedrec.verid.ui2.AbstractVerIDSession
import com.appliedrec.verid.ui2.VerIDSession
import com.appliedrec.verid.ui2.VerIDSessionDelegate
import com.facebook.react.bridge.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.*
import java.io.ByteArrayInputStream


class ReactNativePluginVerIdModule(var mContext: ReactApplicationContext): ReactContextBaseJavaModule(mContext) {

    protected val REQUEST_CODE_REGISTER = 1
    protected val REQUEST_CODE_AUTHENTICATE = 2
    protected val REQUEST_CODE_DETECT_LIVENESS = 3
    protected var TESTING_MODE = false
    protected var verID: VerID? = null
    private var promiseCallback: Promise? = null

    override fun getName(): String {
        return "ReactNativePluginVerId"
    }

    @ReactMethod
    fun loadWithPassword(password: String, promise: Promise) {

        GlobalScope.launch {
            loadVerIDAndRun(password, promise, Runnable {
                promise.resolve("OK")
            })
        }
    }

    @ReactMethod
    fun load(promise: Promise) {

        GlobalScope.launch {
            loadVerIDAndRun(null, promise, Runnable {
                promise.resolve("OK")
            })
        }

    }

    @ReactMethod
    fun setTestingMode(mode: Boolean, promise: Promise) {

        GlobalScope.launch {
            TESTING_MODE = mode
            promise.resolve("OK, testing mode set to: $mode")
        }

    }

    @ReactMethod
    fun unload(promise: Promise) {

        GlobalScope.launch {
            verID = null
            promise.resolve("OK")
        }

    }

    @ReactMethod
    fun registerUser(args: ReadableArray, promise: Promise) {
        if (TESTING_MODE) {
            promise.resolve(Mockups.getAttachmentMockup())
        } else {
            GlobalScope.launch {
                try {
                    promiseCallback = promise
                    val jsonSettings = args.getMap(0)?.getString("settings")
                    val gson = Gson()
                    val settings: RegistrationSessionSettings = gson.fromJson(jsonSettings, RegistrationSessionSettings::class.java)
                    loadVerIDAndStartSession(null, promise, settings)
                } catch (error: Exception) {
                    promise.reject(error)
                }
            }
        }
    }

    @ReactMethod
    fun authenticate(args: ReadableArray, promise: Promise) {
        if (TESTING_MODE) {
            promise.resolve(Mockups.getAttachmentMockup())
        } else {
            GlobalScope.launch {
                try {
                    promiseCallback = promise
                    val jsonSettings = args.getMap(0)?.getString("settings")
                    val gson = Gson()
                    val settings: AuthenticationSessionSettings = gson.fromJson(jsonSettings, AuthenticationSessionSettings::class.java)
                    loadVerIDAndStartSession(null, promise, settings)
                } catch (error: Exception) {
                    promise.reject(error)
                }
            }
        }
    }

    @ReactMethod
    fun captureLiveFace(args: ReadableArray, promise: Promise) {
        if (TESTING_MODE) {
            promise.resolve(Mockups.getAttachmentMockup())
        } else {
            GlobalScope.launch {
                try {
                    promiseCallback = promise
                    val jsonSettings = args.getMap(0)?.getString("settings")
                    val gson = Gson()
                    val settings: LivenessDetectionSessionSettings = gson.fromJson(jsonSettings, LivenessDetectionSessionSettings::class.java)
                    loadVerIDAndStartSession(null, promise, settings)
                } catch (error: Exception) {
                    promise.reject(error)
                }
            }
        }
    }

    @ReactMethod
    fun getRegisteredUsers(promise: Promise) {
        loadVerIDAndRun(null, promise, Runnable {
            GlobalScope.launch {
                try {
                    val users = verID!!.userManagement.users
                    val gson = Gson()
                    var usersFound = ""
                    usersFound = if (TESTING_MODE) {
                        "[\"user1\", \"user2\", \"user3\"]"
                    } else {
                        gson.toJson(users, Array<String>::class.java)
                    }

                    promise.resolve(usersFound);
                } catch (e: Exception) {
                    e.printStackTrace()
                    promise.reject(e)
                }
            }
        })
    }

    @ReactMethod
    fun deleteUser(userId: String, promise: Promise) {
        if (userId != null) {
            GlobalScope.launch {
                loadVerIDAndRun(null, promise, Runnable {
                    try {
                        verID?.userManagement?.deleteUsers(arrayOf(userId))
                        mContext.currentActivity?.runOnUiThread(Runnable {
                            promise.resolve("OK")
                        })
                    } catch (e: Exception) {
                        e.printStackTrace();
                        mContext.currentActivity?.runOnUiThread(Runnable {
                            promise.reject(e)
                        })
                    }
                })
            }
        }
    }

    @ReactMethod
    fun compareFaces(face1: String, face2: String, promise: Promise) {
        loadVerIDAndRun(null, promise, Runnable {
           GlobalScope.launch {
                try {
                    val gson = Gson()
                    val face1 = gson.fromJson(face1, RecognizableFace::class.java)
                    val face2 = gson.fromJson(face2, RecognizableFace::class.java)
                    val score = verID!!.faceRecognition.compareSubjectFacesToFaces(arrayOf(face1), arrayOf(face2))
                    val response = JsonObject()

                    response.addProperty("score", score)
                    response.addProperty("authenticationThreshold", verID!!.faceRecognition.authenticationThreshold)
                    response.addProperty("max", verID!!.faceRecognition.maxAuthenticationScore)

                    val jsonResponse = gson.toJson(response)
                    promise.resolve(jsonResponse)
                } catch (e: Exception) {
                    e.printStackTrace()
                    promise.reject(e)
                }
            }
        })
    }

    @ReactMethod
    fun detectFaceInImage(image: String, promise: Promise) {
        loadVerIDAndRun(null, promise, Runnable {
            GlobalScope.launch {
                try {
                    if (image == null) {
                        throw Exception("Image argument is null")
                    }
                    if (!image.startsWith("data:image/")) {
                        throw Exception("Invalid image argument")
                    }
                    var dataIndex = image.indexOf("base64,")
                    if (dataIndex == -1) {
                        throw Exception("Invalid image argument")
                    }
                    dataIndex += 7
                    if (dataIndex >= image.length) {
                        throw Exception("Invalid image length")
                    }
                    val inputStream = ByteArrayInputStream(image.substring(dataIndex).toByteArray(charset("UTF-8")))
                    val base64InputStream = Base64InputStream(inputStream, Base64.NO_WRAP)
                    val bitmap = BitmapFactory.decodeStream(base64InputStream)
                            ?: throw Exception("Bitmap decoding error")
                    val verIDImage = VerIDImageBitmap(bitmap, ExifInterface.ORIENTATION_NORMAL)
                    val faces = verID!!.getFaceDetection<FaceDetectionImage>().detectFacesInImage(verIDImage.createFaceDetectionImage(), 1, 0)

                    if (faces.isEmpty()) {
                        throw Exception("Face not found")
                    }

                    val recognizableFaces = verID!!.faceRecognition.createRecognizableFacesFromFaces(faces, verIDImage)
                    val gson = Gson()
                    val encodedFace = gson.toJson(recognizableFaces[0])
                    promise.resolve(encodedFace)
                } catch (e: Exception) {
                    promise.reject(e)
                }
            }
        })
    }

    protected fun loadVerIDAndRun(password: String?, promise: Promise, runnable: Runnable) {
        if (verID != null) {
            runnable.run()
        } else {
            val verIDFactory = VerIDFactory(mContext, object : VerIDFactoryDelegate {

                override fun onVerIDCreated(verIDFactory: VerIDFactory?, verID: VerID?) {
                    this@ReactNativePluginVerIdModule.verID = verID
                    runnable.run()
                }

                override fun onVerIDCreationFailed(verIDFactory: VerIDFactory?, e: java.lang.Exception?) {
                    promise.reject(e)
                }
            })


            if (password != null) {
                verIDFactory.setVeridPassword(password)
            }

            verIDFactory.createVerID()
        }
    }

    protected fun loadVerIDAndStartSession(password: String?, promise: Promise, settings: VerIDSessionSettings) {
        loadVerIDAndRun(password, promise, Runnable {
            if (verID == null) {
                promise.reject(java.lang.Exception("Ver-ID is null"))
                return@Runnable
            }
            val session: VerIDSession<out VerIDSessionSettings> = VerIDSession(verID!!, settings)
            session.setDelegate(SessionDelegate(promise))
            session.start()
        })
    }
}

class Mockups {
    // Mockups for testing
    companion object {
        @JvmStatic
        fun getAttachmentMockup(): String {
            var faceMockup : String = getFaceMockup()
            var mockup = "{\"attachments\": [";
            mockup += "{\"recognizableFace\": " + faceMockup + ", \"image\": \"TESTING_IMAGE\", \"bearing\": \"STRAIGHT\"}";
            mockup += "]}";

            return mockup
        }
        fun getFaceMockup(): String {
            var faceMockup : String = "{\"x\":-8.384888,\"y\":143.6514,\"width\":331.54974,\"height\":414.43723,\"yaw\":-0.07131743,";
            faceMockup += "\"pitch\":-6.6307373,\"roll\":-2.5829313,\"quality\":9.658932,";
            faceMockup += "\"leftEye\":[101,322.5],\"rightEye\":[213,321],";
            faceMockup += "\"data\":\"TESTING_DATA\",";
            faceMockup += "\"faceTemplate\":{\"data\":\"FACE_TEMPLATE_TEST_DATA\",\"version\":1}}";

            return faceMockup;
        }
    }
}

class SessionDelegate: VerIDSessionDelegate {

    val promise: Promise

    constructor(promise: Promise) {
        this.promise = promise
    }

    override fun onSessionFinished(session: AbstractVerIDSession<*, *, *>?, result: VerIDSessionResult?) {
        promise.resolve(result)
    }

    override fun onSessionCanceled(session: AbstractVerIDSession<*, *, *>?) {
        promise.resolve(null)
    }

}
