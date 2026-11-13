package com.yomy.ramdan;

import android.content.*;
import android.os.Build;
import android.util.Log;

public class AzanReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (!"com.yomy.AZAN".equals(intent.getAction())) {
            // Reboot restores future alarms only; never start playback from boot.
            try { AzanPlugin.restore(context); } catch (Exception e) { Log.w("Azan", "Restore failed", e); }
            return;
        }
        long late = System.currentTimeMillis() - intent.getLongExtra("at", 0);
        if (late < 0 || late > 120000) return;
        if (!context.getSharedPreferences(AzanPlugin.PREFS, 0).contains("audio")) return;
        Intent service = new Intent(context, AzanService.class).putExtra("label", intent.getStringExtra("label"));
        try {
            if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(service);
            else context.startService(service);
        } catch (Exception e) { Log.w("Azan", "Playback unavailable", e); }
    }
}
