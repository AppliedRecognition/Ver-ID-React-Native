package com.appliedrecreactnativepluginverid

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.appliedrec.verid.core.VerID
import com.appliedrec.verid.core.VerIDFactory
import com.appliedrec.verid.core.VerIDFactoryDelegate
import com.appliedrec.verid.core.VerIDSessionResult
import com.appliedrec.verid.ui.VerIDSessionActivity
import com.facebook.react.bridge.*
import com.google.gson.Gson
import kotlinx.coroutines.Runnable
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking


class ReactNativePluginVerIdModule(var mContext: ReactApplicationContext): ReactContextBaseJavaModule(mContext), ActivityEventListener {

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
    fun loadWithPassword(password: String, promise: Promise) = runBlocking  {

        launch {
            loadVerIDAndRun(password, promise, Runnable {
                promise.resolve("OK")
            })
        }
    }

    @ReactMethod
    fun load(promise: Promise) = runBlocking  {

        launch {
            loadVerIDAndRun(null, promise, Runnable {
                promise.resolve("OK")
            })
        }

    }

    @ReactMethod
    fun setTestingMode(mode: Boolean, promise: Promise) = runBlocking  {

        launch {
            TESTING_MODE = mode
            promise.resolve("OK, testing mode set to: $mode")
        }

    }
    @ReactMethod
    fun unload(promise: Promise) = runBlocking  {

        launch {
            verID = null
            promise.resolve("OK")
        }

    }


    
    protected interface IntentFactory {
        fun createIntent(): Intent?
    }

    protected fun loadVerIDAndRun(password: String?, promise: Promise, runnable: Runnable) {
        if (verID != null) {
            runnable.run()
        } else {
            val verIDFactory = VerIDFactory(mContext, object : VerIDFactoryDelegate {
                    override fun veridFactoryDidCreateEnvironment(verIDFactory: VerIDFactory, instance: VerID) {
                        println("veridFactoryDidCreateEnvironment")
                        verID = instance
                        runnable.run()
                    }

                    override fun veridFactoryDidFailWithException(verIDFactory: VerIDFactory, e: Exception) {
                        println("veridFactoryDidFailWithException")
                        promise.reject(e)
                    }
                })


            if (password != null) {
                verIDFactory.setVeridPassword(password)
            }

            verIDFactory.createVerID()
        }
    }

    override fun onNewIntent(intent: Intent?) {
        TODO("Not yet implemented")
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {

        if (promiseCallback != null && (requestCode == REQUEST_CODE_REGISTER || requestCode == REQUEST_CODE_AUTHENTICATE || requestCode == REQUEST_CODE_DETECT_LIVENESS)) {
            val activity = this.currentActivity
            runBlocking  {

                async {
                    val gson = Gson()
                    val result: VerIDSessionResult? = if (resultCode == Activity.RESULT_OK && data != null) {
                        data.getParcelableExtra(VerIDSessionActivity.EXTRA_RESULT)
                    } else if (resultCode == Activity.RESULT_CANCELED) {
                        null
                    } else {
                        VerIDSessionResult(Exception("Unknown failure"))
                    }

                    val response = gson.toJson(result, VerIDSessionResult::class.java)
                    if (promiseCallback != null) {
                        if (activity != null) {
                            if (activity.isDestroyed) {
                                promiseCallback!!.reject(Error( "Activity is destroyed"))
                            } else {
                                promiseCallback!!.resolve(response)
                                promiseCallback = null
                            }
                        } else {
                            promiseCallback!!.reject(Error( "Activity is null"))
                        }

                    } else {
                        throw Error("Promise Callback is null")
                    }
                }

            }

        }
    }

}
