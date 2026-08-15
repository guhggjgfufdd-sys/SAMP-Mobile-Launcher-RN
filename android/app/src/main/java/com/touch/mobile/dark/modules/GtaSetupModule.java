package com.touch.mobile.dark.modules;

import android.app.Activity;
import android.content.Intent;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.touch.mobile.dark.MainGTA;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;

public class GtaSetupModule extends ReactContextBaseJavaModule {

    private static final String TAG = "GtaSetupModule";

    public GtaSetupModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "GtaSetupModule";
    }

    // الدالة الأصلية (نحتفظ فيها)
    @ReactMethod
    public void startGame(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            Intent intent = new Intent(getReactApplicationContext(), MainGTA.class);
            if (activity != null) {
                intent.putExtras(activity.getIntent());
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                activity.finish();
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    // الدالة الجديدة (تكتب إعدادات السيرفر ثم تفتح MainGTA)
    @ReactMethod
    public void launchGame(ReadableMap serverData, Promise promise) {
        try {
            String serverAddress = serverData.getString("address");
            String playerName = serverData.getString("playerName");

            if (serverAddress == null || serverAddress.isEmpty()) {
                promise.reject("Error", "Server address is empty!");
                return;
            }

            // 1. اكتب إعدادات السيرفر
            writeSampConfig(serverAddress, playerName);

            // 2. افتح MainGTA
            Activity activity = getCurrentActivity();
            Intent intent = new Intent(getReactApplicationContext(), MainGTA.class);
            if (activity != null) {
                intent.putExtras(activity.getIntent());
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                activity.finish();
            }

            promise.resolve(null);

        } catch (Exception e) {
            Log.e(TAG, "Error launching game: " + e.getMessage());
            promise.reject("Error", e);
        }
    }

    private void writeSampConfig(String serverAddress, String playerName) {
        try {
            File gtaDir = new File(Environment.getExternalStorageDirectory(),
                    "Android/data/com.rockstargames.gtasa/files");

            if (!gtaDir.exists()) {
                gtaDir.mkdirs();
            }

            File sampDir = new File(gtaDir, "SAMP");
            if (!sampDir.exists()) {
                sampDir.mkdirs();
            }

            File sampCfg = new File(sampDir, "settings.ini");

            String[] parts = serverAddress.split(":");
            String ip = parts[0];
            String port = parts.length > 1 ? parts[1] : "7777";

            String config = "[client]\n" +
                    "nick=" + (playerName != null ? playerName : "Player") + "\n" +
                    "ip=" + ip + "\n" +
                    "port=" + port + "\n";

            FileOutputStream fos = new FileOutputStream(sampCfg);
            OutputStreamWriter writer = new OutputStreamWriter(fos);
            writer.write(config);
            writer.close();
            fos.close();

            Log.d(TAG, "Config written to: " + sampCfg.getAbsolutePath());

        } catch (Exception e) {
            Log.e(TAG, "Error writing config: " + e.getMessage());
        }
    }
}
