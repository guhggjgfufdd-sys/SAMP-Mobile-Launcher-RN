package com.touch.mobile.dark;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;

public class GtaSetupModule extends ReactContextBaseJavaModule {
    private static final String TAG = "GtaSetupModule";
    private final ReactApplicationContext reactContext;

    public GtaSetupModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "GtaSetupModule";
    }

    @ReactMethod
    public void launchGame(ReadableMap serverData) {
        try {
            // ← 1. استخراج بيانات السيرفر
            String serverAddress = serverData.getString("address"); // مثال: 142.132.203.47:21299
            String serverName = serverData.getString("name");
            String playerName = serverData.getString("playerName"); // النيك نيم من الإعدادات
            
            if (serverAddress == null || serverAddress.isEmpty()) {
                Log.e(TAG, "Server address is empty!");
                return;
            }

            // ← 2. كتابة ملف SAMP.cfg في مجلد اللعبة
            writeSampConfig(serverAddress, playerName);

            // ← 3. فتح اللعبة
            openGtaSa();

        } catch (Exception e) {
            Log.e(TAG, "Error launching game: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void writeSampConfig(String serverAddress, String playerName) {
        try {
            // مجلد GTA SA على Android
            File gtaDir = new File(Environment.getExternalStorageDirectory(), "Android/data/com.rockstargames.gtasa/files");
            
            if (!gtaDir.exists()) {
                gtaDir.mkdirs();
            }

            File sampCfg = new File(gtaDir, "SAMP/settings.ini");
            
            // تأكد إن المجلد موجود
            File sampDir = new File(gtaDir, "SAMP");
            if (!sampDir.exists()) {
                sampDir.mkdirs();
            }

            // كتابة الإعدادات
            String config = "[client]\n" +
                    "nick=" + (playerName != null ? playerName : "Player") + "\n" +
                    "server=" + serverAddress + "\n" +
                    "port=" + getPort(serverAddress) + "\n";

            FileOutputStream fos = new FileOutputStream(sampCfg);
            OutputStreamWriter writer = new OutputStreamWriter(fos);
            writer.write(config);
            writer.close();
            fos.close();

            Log.d(TAG, "SAMP config written successfully to: " + sampCfg.getAbsolutePath());

        } catch (Exception e) {
            Log.e(TAG, "Error writing SAMP config: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getPort(String address) {
        if (address.contains(":")) {
            return address.split(":")[1];
        }
        return "7777"; // البورت الافتراضي
    }

    private void openGtaSa() {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                Log.e(TAG, "Activity is null!");
                return;
            }

            PackageManager pm = activity.getPackageManager();
            Intent intent = pm.getLaunchIntentForPackage("com.rockstargames.gtasa");

            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(intent);
                Log.d(TAG, "GTA SA launched successfully");
            } else {
                Log.e(TAG, "GTA SA not installed! Package not found.");
            }

        } catch (Exception e) {
            Log.e(TAG, "Error opening GTA SA: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
