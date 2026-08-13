package com.touch.mobile.dark.modules;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Intent;
import com.touch.mobile.dark.MainGTA;

public class GtaSetupModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public GtaSetupModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "GtaSetupModule";
    }

    @ReactMethod
    public void launchGame() {
        Intent intent = new Intent(reactContext, MainGTA.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void startGame() {
        launchGame();
    }
}
