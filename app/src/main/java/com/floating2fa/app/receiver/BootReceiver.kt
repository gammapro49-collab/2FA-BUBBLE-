package com.floating2fa.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.floating2fa.app.service.FloatingBubbleService

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            val prefs = context.getSharedPreferences("floating_2fa_prefs", Context.MODE_PRIVATE)
            val isBubbleEnabled = prefs.getBoolean("bubble_enabled", true)

            if (isBubbleEnabled && Settings.canDrawOverlays(context)) {
                val serviceIntent = Intent(context, FloatingBubbleService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
