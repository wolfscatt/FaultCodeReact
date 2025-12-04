package com.faultcode.ads

import android.app.Activity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.startapp.sdk.adsbase.StartAppAd
import com.startapp.sdk.adsbase.StartAppSDK
import com.startapp.sdk.adsbase.adlisteners.AdEventListener

class StartIOAdModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var interstitialAd: StartAppAd? = null
    private var isInitialized = false

    override fun getName(): String {
        return "StartIOAdModule"
    }

    @ReactMethod
    fun initialize(appId: String, promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No current activity available")
                return
            }

            // Initialize StartApp SDK
            StartAppSDK.init(activity, appId, false) // false = disable default splash ads
            
            isInitialized = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize Start.io SDK: ${e.message}", e)
        }
    }

    @ReactMethod
    fun loadInterstitial(promise: Promise) {
        try {
            if (!isInitialized) {
                promise.reject("NOT_INITIALIZED", "Start.io SDK not initialized. Call initialize() first.")
                return
            }

            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No current activity available")
                return
            }

            // Create and load interstitial ad (AUTOMATIC type)
            interstitialAd = StartAppAd(activity)
            interstitialAd?.loadAd(StartAppAd.AdMode.AUTOMATIC, object : AdEventListener {
                override fun onReceiveAd(ad: com.startapp.sdk.adsbase.Ad) {
                    promise.resolve(true)
                }

                override fun onFailedToReceiveAd(ad: com.startapp.sdk.adsbase.Ad) {
                    promise.reject("LOAD_FAILED", "Failed to load interstitial ad")
                }
            })
        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", "Error loading interstitial ad: ${e.message}", e)
        }
    }

    @ReactMethod
    fun showInterstitial(promise: Promise) {
        try {
            if (!isInitialized) {
                promise.reject("NOT_INITIALIZED", "Start.io SDK not initialized")
                return
            }

            val ad = interstitialAd
            if (ad == null) {
                promise.reject("NO_AD", "No interstitial ad loaded. Call loadInterstitial() first.")
                return
            }

            val activity = currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No current activity available")
                return
            }

            // Show the interstitial ad
            // Start.io showAd() returns void, so we resolve immediately
            // The ad will display asynchronously
            ad.showAd()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHOW_ERROR", "Error showing interstitial ad: ${e.message}", e)
        }
    }
}
