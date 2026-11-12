package com.floating2fa.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class Floating2FAApp : Application() {

    companion object {
        const val OVERLAY_CHANNEL_ID = "floating_bubble_service_channel"
        const val NOTIFICATION_ID = 2001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                OVERLAY_CHANNEL_ID,
                "Floating 2FA Bubble Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the Floating 2FA bubble active over other apps"
                setShowBadge(false)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }
}
