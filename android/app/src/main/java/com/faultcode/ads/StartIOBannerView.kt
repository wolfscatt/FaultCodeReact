package com.faultcode.ads

import android.content.Context
import android.widget.FrameLayout
import com.startapp.sdk.ads.banner.Banner
import com.startapp.sdk.ads.banner.BannerListener

class StartIOBannerView(context: Context) : FrameLayout(context) {
    private var banner: Banner? = null

    init {
        // Create StartApp Banner
        banner = Banner(context, object : BannerListener {
            override fun onReceiveAd(banner: Banner?) {
                // Banner ad loaded successfully
            }

            override fun onFailedToReceiveAd(banner: Banner?) {
                // Banner ad failed to load
            }
        })

        // Add banner to this view
        banner?.let {
            addView(it)
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        banner?.loadAd()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        banner?.onPause()
    }

    fun onPause() {
        banner?.onPause()
    }

    fun onResume() {
        banner?.onResume()
    }
}
