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
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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

    @ReactMethod
    public void launchGame(ReadableMap serverData, Promise promise) {
        try {
            String serverAddress = serverData.getString("address");
            String playerName = serverData.getString("playerName");

            if (serverAddress == null || serverAddress.isEmpty()) {
                promise.reject("Error", "Server address is empty!");
                return;
            }

            // ← 1. انسخ ملفات الكاش تلقائياً من Download/SAMP
            copyCacheFiles();

            // ← 2. اكتب إعدادات السيرفر
            writeSampConfig(serverAddress, playerName);

            // ← 3. افتح اللعبة
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

    // ← دالة جديدة: نسخ ملفات الكاش تلقائياً
    private void copyCacheFiles() {
        try {
            File sourceDir = new File(Environment.getExternalStorageDirectory(), "Download/SAMP");
            File targetDir = getReactApplicationContext().getExternalFilesDir(null);

            if (!sourceDir.exists()) {
                Log.w(TAG, "Cache not found in: " + sourceDir.getAbsolutePath());
                return;
            }

            if (targetDir == null) {
                Log.e(TAG, "Target dir is null!");
                return;
            }

            // انسخ فقط إذا الملفات مو موجودة في الهدف (أول مرة فقط)
            File checkFile = new File(targetDir, "stream.ini");
            if (!checkFile.exists()) {
                Log.d(TAG, "Copying cache files...");
                copyDirectory(sourceDir, targetDir);
                Log.d(TAG, "Cache copied to: " + targetDir.getAbsolutePath());
            } else {
                Log.d(TAG, "Cache already exists, skipping copy");
            }

        } catch (Exception e) {
            Log.e(TAG, "Error copying cache: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void copyDirectory(File source, File target) throws IOException {
        if (source.isDirectory()) {
            if (!target.exists()) {
                target.mkdirs();
            }
            String[] children = source.list();
            if (children != null) {
                for (String child : children) {
                    copyDirectory(new File(source, child), new File(target, child));
                }
            }
        } else {
            copyFile(source, target);
        }
    }

    private void copyFile(File source, File target) throws IOException {
        try (InputStream in = new FileInputStream(source);
             OutputStream out = new FileOutputStream(target)) {
            byte[] buf = new byte[8192];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
        }
    }

    private void writeSampConfig(String serverAddress, String playerName) {
        try {
            File gtaDir = getReactApplicationContext().getExternalFilesDir(null);
            if (gtaDir == null) {
                Log.e(TAG, "External files dir is null!");
                return;
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
            e.printStackTrace();
        }
    }
}
