package com.floating2fa.app.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import com.floating2fa.app.Floating2FAApp
import com.floating2fa.app.R
import com.floating2fa.app.ui.MainActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class FloatingBubbleService : Service() {

    private lateinit var windowManager: WindowManager
    private var bubbleView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        startForegroundNotification()
    }

    private fun startForegroundNotification() {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification: Notification = NotificationCompat.Builder(this, Floating2FAApp.OVERLAY_CHANNEL_ID)
            .setContentTitle("Floating 2FA is active")
            .setContentText("Tap to open your floating 2FA authenticator")
            .setSmallIcon(R.drawable.ic_shield_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(Floating2FAApp.NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        bubbleView?.let {
            if (it.isAttachedToWindow) {
                windowManager.removeView(it)
            }
        }
    }
}
