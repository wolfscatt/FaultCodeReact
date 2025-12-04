package com.faultcode.ads

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class StartIOBannerViewManager : SimpleViewManager<StartIOBannerView>() {
    override fun getName(): String {
        return "StartIOBannerView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): StartIOBannerView {
        return StartIOBannerView(reactContext)
    }

    override fun onDropViewInstance(view: StartIOBannerView) {
        super.onDropViewInstance(view)
        view.onPause()
    }
}
