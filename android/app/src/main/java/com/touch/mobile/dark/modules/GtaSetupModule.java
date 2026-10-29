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
import java.io.ByteArrayOutputStream;
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
                if (activity == null) {
                    throw new IllegalStateException("Launcher activity is unavailable");
                }
                Intent intent = new Intent(activity, MainGTA.class);
                intent.putExtras(activity.getIntent());
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(intent);
                activity.finish();

                promise.resolve(null);

        } catch (Exception e) {
            Log.e(TAG, "Error launching game: " + e.getMessage());
            promise.reject("Error", e);
        }
    }

    private void copyCacheFiles() throws IOException {
            File targetDir = getReactApplicationContext().getExternalFilesDir(null);
            if (targetDir == null) {
                throw new IOException("Game storage is unavailable");
            }

            File cacheDir = new File(targetDir, "SAMP-cache");
            File sourceVersion = new File(cacheDir, ".cache-version");
            if (!sourceVersion.isFile()) {
                throw new IOException("SA-MP cache is not installed");
            }

            String version = readTextFile(sourceVersion).trim();
            if (version.isEmpty()) {
                throw new IOException("SA-MP cache version marker is invalid");
            }

            File installedVersion = new File(targetDir, ".cache-version");
            if (installedVersion.isFile() && version.equals(readTextFile(installedVersion).trim())) {
                return;
            }

            copyDirectory(cacheDir, targetDir);
            if (!installedVersion.isFile() || !version.equals(readTextFile(installedVersion).trim())) {
                throw new IOException("Could not copy the SA-MP cache into game storage");
            }
            Log.i(TAG, "Installed SA-MP cache version " + version);
        }

        private String readTextFile(File file) throws IOException {
            try (FileInputStream input = new FileInputStream(file);
                 ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[1024];
                int length;
                while ((length = input.read(buffer)) != -1) {
                    output.write(buffer, 0, length);
                }
                return output.toString("UTF-8");
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
