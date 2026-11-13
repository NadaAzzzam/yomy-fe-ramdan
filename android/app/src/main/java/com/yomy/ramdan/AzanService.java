package com.yomy.ramdan;

import android.app.*;
import android.content.*;
import android.media.*;
import android.os.*;
import java.io.File;

public class AzanService extends Service {
    private MediaPlayer player;
    private AudioManager audioManager;
    private AudioFocusRequest focus;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override public int onStartCommand(Intent intent, int flags, int id) {
        if (intent == null || "STOP".equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }
        releasePlayer();
        NotificationManager notifications = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel("azan_playback", "الأذان", NotificationManager.IMPORTANCE_LOW);
            channel.setSound(null, null);
            notifications.createNotificationChannel(channel);
        }
        PendingIntent stop = PendingIntent.getService(this, 0, new Intent(this, AzanService.class).setAction("STOP"),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, "azan_playback") : new Notification.Builder(this);
        startForeground(7900, builder.setSmallIcon(R.drawable.ic_notification).setContentTitle("حان وقت صلاة " + intent.getStringExtra("label"))
            .setContentText("اضغط إيقاف لإنهاء الأذان").setContentIntent(open).setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "إيقاف", stop).build());
        try {
            audioManager = getSystemService(AudioManager.class);
            AudioAttributes attributes = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
            if (Build.VERSION.SDK_INT >= 26) {
                focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                    .setAudioAttributes(attributes).setOnAudioFocusChangeListener(change -> {
                        if (change < 0) stopSelf();
                    }).build();
                if (audioManager.requestAudioFocus(focus) != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                    stopSelf(); return START_NOT_STICKY;
                }
            }
            String path = getSharedPreferences(AzanPlugin.PREFS, 0).getString("audio", "");
            if (!new File(path).exists()) { stopSelf(); return START_NOT_STICKY; }
            player = new MediaPlayer();
            player.setAudioAttributes(attributes);
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(path);
            player.setOnPreparedListener(MediaPlayer::start);
            player.setOnCompletionListener(mp -> stopSelf());
            player.setOnErrorListener((mp, what, extra) -> { stopSelf(); return true; });
            player.prepareAsync();
            handler.postDelayed(this::stopSelf, 10 * 60 * 1000);
        } catch (Exception e) { stopSelf(); }
        return START_NOT_STICKY;
    }
    private void releasePlayer() {
        handler.removeCallbacksAndMessages(null);
        if (player != null) { player.release(); player = null; }
        if (audioManager != null && focus != null && Build.VERSION.SDK_INT >= 26) audioManager.abandonAudioFocusRequest(focus);
        focus = null;
    }
    @Override public void onDestroy() { releasePlayer(); stopForeground(true); super.onDestroy(); }
    @Override public IBinder onBind(Intent intent) { return null; }
}
