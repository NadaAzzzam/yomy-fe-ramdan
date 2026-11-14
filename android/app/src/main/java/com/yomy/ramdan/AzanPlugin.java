package com.yomy.ramdan;

import android.app.*;
import android.content.*;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.*;
import java.io.*;
import java.net.*;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "Azan")
public class AzanPlugin extends Plugin {
    static final String PREFS = "azan";
    static final int LIMIT = 155;
    private final java.util.concurrent.atomic.AtomicInteger generation = new java.util.concurrent.atomic.AtomicInteger();
    private static final java.util.concurrent.ExecutorService IO = Executors.newSingleThreadExecutor();

    @PluginMethod public void status(PluginCall call) {
        AlarmManager manager = getContext().getSystemService(AlarmManager.class);
        JSObject result = new JSObject();
        result.put("exact", Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms());
        call.resolve(result);
    }
    @PluginMethod public void openSettings(PluginCall call) {
        Intent intent = Build.VERSION.SDK_INT >= 31
            ? new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getContext().getPackageName()))
            : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
        if (Build.VERSION.SDK_INT >= 33 && getContext().checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
        }
        getActivity().startActivity(intent);
        call.resolve();
    }
    @PluginMethod public void cancel(PluginCall call) {
        generation.incrementAndGet();
        clear(getContext());
        getContext().getSharedPreferences(PREFS, 0).edit().clear().apply();
        getContext().stopService(new Intent(getContext(), AzanService.class));
        call.resolve();
    }
    @PluginMethod public void schedule(PluginCall call) {
        String url = call.getString("url");
        JSArray alarms = call.getArray("alarms");
        // Only the bundled sound catalogue is accepted; never download arbitrary URLs.
        if (url == null || !url.matches("https://cdn\\.aladhan\\.com/audio/adhans/[a-zA-Z0-9_-]+\\.mp3") || alarms == null || alarms.length() > LIMIT) {
            call.reject("Invalid azan schedule"); return;
        }
        int token = generation.incrementAndGet();
        IO.execute(() -> {
            File pending = new File(getContext().getFilesDir(), "azan-download.tmp");
            try {
                File audio = new File(getContext().getFilesDir(), "azan-" + Uri.parse(url).getLastPathSegment());
                if (!audio.exists() || audio.length() == 0) {
                    HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(20000);
                    try {
                        if (connection.getResponseCode() != 200) throw new IOException("Audio unavailable");
                        String type = connection.getContentType();
                        if (type == null || !(type.startsWith("audio/") || type.startsWith("application/octet-stream"))) throw new IOException("Invalid audio");
                        try (InputStream in = connection.getInputStream(); FileOutputStream out = new FileOutputStream(pending)) {
                            byte[] buffer = new byte[8192]; int size; long total = 0;
                            while ((size = in.read(buffer)) != -1) {
                                total += size;
                                if (total > 20 * 1024 * 1024) throw new IOException("Audio too large");
                                out.write(buffer, 0, size);
                            }
                        }
                    } finally { connection.disconnect(); }
                    if (pending.length() == 0 || !pending.renameTo(audio)) throw new IOException("Audio storage failed");
                }
                AlarmManager manager = getContext().getSystemService(AlarmManager.class);
                if (Build.VERSION.SDK_INT >= 31 && !manager.canScheduleExactAlarms()) throw new SecurityException("Allow alarms and reminders");
                if (token != generation.get()) { call.reject("Cancelled"); return; }
                clear(getContext());
                getContext().getSharedPreferences(PREFS, 0).edit()
                    .putString("alarms", alarms.toString()).putString("audio", audio.getAbsolutePath()).commit();
                restore(getContext());
                call.resolve();
            } catch (Exception e) {
                pending.delete();
                call.reject("Cannot schedule azan", e);
            }
        });
    }
    static PendingIntent alarm(Context context, int id, long at, String label) {
        Intent intent = new Intent(context, AzanReceiver.class).setAction("com.yomy.AZAN")
            .putExtra("at", at).putExtra("label", label);
        return PendingIntent.getBroadcast(context, 8000 + id, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static void clear(Context context) {
        AlarmManager manager = context.getSystemService(AlarmManager.class);
        for (int i = 0; i < LIMIT; i++) manager.cancel(alarm(context, i, 0, ""));
    }
    static void restore(Context context) throws JSONException {
        AlarmManager manager = context.getSystemService(AlarmManager.class);
        if (Build.VERSION.SDK_INT >= 31 && !manager.canScheduleExactAlarms()) return;
        JSONArray alarms = new JSONArray(context.getSharedPreferences(PREFS, 0).getString("alarms", "[]"));
        for (int i = 0; i < Math.min(alarms.length(), LIMIT); i++) {
            JSONObject item = alarms.getJSONObject(i);
            long at = item.getLong("at");
            if (at > System.currentTimeMillis())
                manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, alarm(context, i, at, item.getString("label")));
        }
    }
}
