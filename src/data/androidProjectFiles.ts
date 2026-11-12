import { AndroidFile } from '../types';

export const androidProjectFiles: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.floating2fa.app">

    <!-- Permissions required for Floating Bubble & 2FA -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:name=".Floating2FAApp"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Floating2FA"
        tools:targetApi="34">

        <!-- Main Activity (Jetpack Compose UI) -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.Floating2FA">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Handle otpauth:// deep links -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="otpauth" android:host="totp" />
            </intent-filter>
        </activity>

        <!-- Floating Bubble Foreground Service (WindowManager Overlay) -->
        <service
            android:name=".service.FloatingBubbleService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Overlay 2FA verification bubble for quick access during logins" />
        </service>

        <!-- Auto-restart Floating Bubble on device reboot -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'gradle',
    category: 'gradle',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.floating2fa.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.floating2fa.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)

    // Android Keystore & Security Crypto
    implementation(libs.androidx.security.crypto)

    // Room Database (Encrypted SQLite)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    kapt(libs.androidx.room.compiler)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // CameraX & ML Kit Barcode Scanning
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)
    implementation(libs.play.services.mlkit.barcode.scanning)

    // Biometrics Prompt
    implementation(libs.androidx.biometric)

    // Coroutines & Lifecycle
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.lifecycle.runtime.ktx)

    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}`,
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'toml',
    category: 'gradle',
    content: `[versions]
agp = "8.2.2"
kotlin = "1.9.22"
coreKtx = "1.12.0"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.02.01"
securityCrypto = "1.1.0-alpha06"
room = "2.6.1"
hilt = "2.50"
hiltNavigationCompose = "1.1.0"
cameraX = "1.3.1"
mlkitBarcode = "18.3.0"
biometric = "1.2.0-alpha05"
coroutines = "1.7.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version = "2.7.7" }

androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }

androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }

androidx-camera-core = { group = "androidx.camera", name = "camera-core", version.ref = "cameraX" }
androidx-camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "cameraX" }
androidx-camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "cameraX" }
androidx-camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "cameraX" }
play-services-mlkit-barcode-scanning = { group = "com.google.android.gms", name = "play-services-mlkit-barcode-scanning", version.ref = "mlkitBarcode" }

androidx-biometric = { group = "androidx.biometric", name = "biometric", version.ref = "biometric" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }
hilt-android = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/Floating2FAApp.kt',
    name: 'Floating2FAApp.kt',
    language: 'kotlin',
    category: 'kotlin_service',
    content: `package com.floating2fa.app

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
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/security/CryptoManager.kt',
    name: 'CryptoManager.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages AES-GCM encryption/decryption using keys securely generated
 * and stored inside the hardware-backed Android KeyStore.
 */
@Singleton
class CryptoManager @Inject constructor() {

    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    companion object {
        private const val KEY_ALIAS = "floating_2fa_master_key"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 128
    }

    private fun getOrCreateSecretKey(): SecretKey {
        val existingKey = keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry
        return existingKey?.secretKey ?: generateSecretKey()
    }

    private fun generateSecretKey(): SecretKey {
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        val spec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .setUserAuthenticationRequired(false)
            .build()

        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }

    fun encrypt(plainText: String): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val key = getOrCreateSecretKey()
        cipher.init(Cipher.ENCRYPT_MODE, key)
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))

        // Combined [IV (12 bytes) + Ciphertext]
        val combined = ByteArray(iv.size + encryptedBytes.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(encryptedBytes, 0, combined, iv.size, encryptedBytes.size)

        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    fun decrypt(encryptedBase64: String): String {
        val combined = Base64.decode(encryptedBase64, Base64.NO_WRAP)
        val iv = ByteArray(GCM_IV_LENGTH)
        System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH)

        val cipherTextSize = combined.size - GCM_IV_LENGTH
        val cipherText = ByteArray(cipherTextSize)
        System.arraycopy(combined, GCM_IV_LENGTH, cipherText, 0, cipherTextSize)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateSecretKey(), spec)

        val decryptedBytes = cipher.doFinal(cipherText)
        return String(decryptedBytes, Charsets.UTF_8)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/totp/TotpGenerator.kt',
    name: 'TotpGenerator.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.totp

import java.nio.ByteBuffer
import java.security.GeneralSecurityException
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.math.pow

/**
 * RFC 6238 / RFC 4226 Time-Based One-Time Password generator.
 * Standard 6-digit output, 30s period, SHA1 HMAC.
 */
object TotpGenerator {

    private const val HMAC_SHA1 = "HmacSHA1"

    /**
     * Generates a TOTP code for the given Base32 secret at the specified timestamp.
     */
    fun generateOtp(
        secretBase32: String,
        timestampMs: Long = System.currentTimeMillis(),
        periodSeconds: Int = 30,
        digits: Int = 6
    ): String {
        return try {
            val keyBytes = decodeBase32(secretBase32)
            if (keyBytes.isEmpty()) return "000000"

            val counter = (timestampMs / 1000) / periodSeconds
            val buffer = ByteBuffer.allocate(8).putLong(counter).array()

            val mac = Mac.getInstance(HMAC_SHA1)
            val keySpec = SecretKeySpec(keyBytes, HMAC_SHA1)
            mac.init(keySpec)
            val hash = mac.doFinal(buffer)

            val offset = hash[hash.size - 1].toInt() and 0x0F
            val binary =
                ((hash[offset].toInt() and 0x7F) shl 24) or
                ((hash[offset + 1].toInt() and 0xFF) shl 16) or
                ((hash[offset + 2].toInt() and 0xFF) shl 8) or
                (hash[offset + 3].toInt() and 0xFF)

            val modulus = 10.0.pow(digits.toDouble()).toInt()
            val code = binary % modulus
            String.format("%0\${digits}d", code)
        } catch (e: Exception) {
            "000000"
        }
    }

    /**
     * Returns seconds remaining in current 30s period and urgency flag (<5s).
     */
    fun getPeriodState(
        timestampMs: Long = System.currentTimeMillis(),
        periodSeconds: Int = 30
    ): PeriodState {
        val seconds = (timestampMs / 1000).toInt()
        val elapsed = seconds % periodSeconds
        val remaining = periodSeconds - elapsed
        val progress = remaining.toFloat() / periodSeconds.toFloat()
        val isUrgent = remaining <= 5
        return PeriodState(remaining, progress, isUrgent)
    }

    /**
     * Decodes RFC 4648 Base32 encoded secret strings (case-insensitive, trims spaces/padding).
     */
    fun decodeBase32(input: String): ByteArray {
        val alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        val clean = input.uppercase().replace("[\\s=-]".toRegex(), "")
        var bits = 0
        var value = 0
        val output = mutableListOf<Byte>()

        for (char in clean) {
            val idx = alphabet.indexOf(char)
            if (idx == -1) continue
            value = (value shl 5) or idx
            bits += 5
            if (bits >= 8) {
                output.add(((value ushr (bits - 8)) and 0xFF).toByte())
                bits -= 8
            }
        }
        return output.toByteArray()
    }

    data class PeriodState(
        val secondsRemaining: Int,
        val progress: Float,
        val isUrgent: Boolean
    )
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/local/AccountEntity.kt',
    name: 'AccountEntity.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "totp_accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    val issuer: String,
    val accountName: String,
    val encryptedSecret: String, // Encrypted using Android Keystore AES-GCM
    val digits: Int = 6,
    val period: Int = 30,
    val algorithm: String = "SHA1",
    val colorHex: String = "#4285F4",
    val createdAt: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/local/AccountDao.kt',
    name: 'AccountDao.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface AccountDao {
    @Query("SELECT * FROM totp_accounts ORDER BY createdAt DESC")
    fun getAllAccounts(): Flow<List<AccountEntity>>

    @Query("SELECT * FROM totp_accounts WHERE id = :id LIMIT 1")
    suspend fun getAccountById(id: String): AccountEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccount(account: AccountEntity)

    @Delete
    suspend fun deleteAccount(account: AccountEntity)

    @Query("DELETE FROM totp_accounts WHERE id = :id")
    suspend fun deleteById(id: String)
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/local/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [AccountEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun accountDao(): AccountDao
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/data/repository/AccountRepository.kt',
    name: 'AccountRepository.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.data.repository

import com.floating2fa.app.data.local.AccountDao
import com.floating2fa.app.data.local.AccountEntity
import com.floating2fa.app.data.security.CryptoManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

data class Account(
    val id: String,
    val issuer: String,
    val accountName: String,
    val secret: String, // Plaintext decrypted secret
    val digits: Int,
    val period: Int,
    val algorithm: String,
    val colorHex: String,
    val createdAt: Long
)

@Singleton
class AccountRepository @Inject constructor(
    private val accountDao: AccountDao,
    private val cryptoManager: CryptoManager
) {

    fun getAccounts(): Flow<List<Account>> {
        return accountDao.getAllAccounts().map { entities ->
            entities.map { entity ->
                Account(
                    id = entity.id,
                    issuer = entity.issuer,
                    accountName = entity.accountName,
                    secret = cryptoManager.decrypt(entity.encryptedSecret),
                    digits = entity.digits,
                    period = entity.period,
                    algorithm = entity.algorithm,
                    colorHex = entity.colorHex,
                    createdAt = entity.createdAt
                )
            }
        }
    }

    suspend fun saveAccount(
        id: String,
        issuer: String,
        accountName: String,
        plainSecret: String,
        digits: Int = 6,
        period: Int = 30,
        colorHex: String = "#4285F4"
    ) {
        val encrypted = cryptoManager.encrypt(plainSecret.trim().uppercase())
        val entity = AccountEntity(
            id = id,
            issuer = issuer.trim(),
            accountName = accountName.trim(),
            encryptedSecret = encrypted,
            digits = digits,
            period = period,
            colorHex = colorHex
        )
        accountDao.insertAccount(entity)
    }

    suspend fun deleteAccount(id: String) {
        accountDao.deleteById(id)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/di/DatabaseModule.kt',
    name: 'DatabaseModule.kt',
    language: 'kotlin',
    category: 'kotlin_data',
    content: `package com.floating2fa.app.di

import android.content.Context
import androidx.room.Room
import com.floating2fa.app.data.local.AccountDao
import com.floating2fa.app.data.local.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "floating_2fa.db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideAccountDao(database: AppDatabase): AccountDao {
        return database.accountDao()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/service/FloatingBubbleService.kt',
    name: 'FloatingBubbleService.kt',
    language: 'kotlin',
    category: 'kotlin_service',
    content: `package com.floating2fa.app.service

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.Point
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.*
import android.view.animation.OvershootInterpolator
import android.widget.Toast
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.floating2fa.app.Floating2FAApp
import com.floating2fa.app.R
import com.floating2fa.app.data.repository.AccountRepository
import com.floating2fa.app.ui.MainActivity
import com.floating2fa.app.ui.overlay.FloatingOverlayContent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.*
import javax.inject.Inject
import kotlin.math.abs

/**
 * Foreground Service that handles the floating 56dp bubble
 * and 300dp expandable overlay card using Android WindowManager.
 */
@AndroidEntryPoint
class FloatingBubbleService : Service() {

    @Inject
    lateinit var repository: AccountRepository

    private lateinit var windowManager: WindowManager
    private var bubbleView: View? = null
    private var cardView: View? = null

    private lateinit var bubbleParams: WindowManager.LayoutParams
    private lateinit var cardParams: WindowManager.LayoutParams

    private var isExpanded = false
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        startForegroundServiceNotification()
        setupBubbleView()
    }

    private fun startForegroundServiceNotification() {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification: Notification = NotificationCompat.Builder(this, Floating2FAApp.OVERLAY_CHANNEL_ID)
            .setContentTitle(getString(R.string.bubble_notification_title))
            .setContentText(getString(R.string.bubble_notification_desc))
            .setSmallIcon(R.drawable.ic_shield_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(Floating2FAApp.NOTIFICATION_ID, notification)
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupBubbleView() {
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        bubbleParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = 300
        }

        val inflater = LayoutInflater.from(this)
        bubbleView = inflater.inflate(R.layout.layout_floating_bubble, null)

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false

        bubbleView?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = bubbleParams.x
                    initialY = bubbleParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = (event.rawX - initialTouchX).toInt()
                    val deltaY = (event.rawY - initialTouchY).toInt()
                    if (abs(deltaX) > 10 || abs(deltaY) > 10) {
                        isDragging = true
                    }
                    if (isDragging) {
                        bubbleParams.x = initialX + deltaX
                        bubbleParams.y = initialY + deltaY
                        windowManager.updateViewLayout(bubbleView, bubbleParams)
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!isDragging) {
                        toggleExpandedCard()
                    } else {
                        snapToNearestEdge()
                    }
                    true
                }
                else -> false
            }
        }

        windowManager.addView(bubbleView, bubbleParams)
    }

    private fun snapToNearestEdge() {
        val size = Point()
        windowManager.defaultDisplay.getSize(size)
        val screenWidth = size.x
        val bubbleWidth = bubbleView?.width ?: 160
        val targetX = if (bubbleParams.x + bubbleWidth / 2 < screenWidth / 2) 0 else screenWidth - bubbleWidth

        val animator = ValueAnimator.ofInt(bubbleParams.x, targetX)
        animator.duration = 250
        animator.interpolator = OvershootInterpolator(1.2f)
        animator.addUpdateListener { anim ->
            bubbleParams.x = anim.animatedValue as Int
            if (bubbleView?.isAttachedToWindow == true) {
                windowManager.updateViewLayout(bubbleView, bubbleParams)
            }
        }
        animator.start()
    }

    private fun toggleExpandedCard() {
        if (isExpanded) {
            collapseCard()
        } else {
            expandCard()
        }
    }

    private fun expandCard() {
        if (isExpanded) return
        isExpanded = true

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        cardParams = WindowManager.LayoutParams(
            (320 * resources.displayMetrics.density).toInt(),
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (bubbleParams.x - 50).coerceAtLeast(30)
            y = (bubbleParams.y + 70).coerceAtLeast(100)
        }

        val composeView = ComposeView(this).apply {
            setContent {
                FloatingOverlayContent(
                    repository = repository,
                    onClose = { collapseCard() },
                    onOpenApp = {
                        collapseCard()
                        val intent = Intent(this@FloatingBubbleService, MainActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                    },
                    onCopyCode = { code ->
                        copyToClipboard(code)
                    }
                )
            }
        }

        cardView = composeView
        windowManager.addView(cardView, cardParams)
    }

    private fun collapseCard() {
        if (!isExpanded) return
        cardView?.let {
            if (it.isAttachedToWindow) {
                windowManager.removeView(it)
            }
        }
        cardView = null
        isExpanded = false
    }

    private fun copyToClipboard(code: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = android.content.ClipData.newPlainText("2FA Code", code)
        clipboard.setPrimaryClip(clip)

        // Haptic feedback
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(50)
        }

        Toast.makeText(this, getString(R.string.copied_to_clipboard), Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        collapseCard()
        bubbleView?.let {
            if (it.isAttachedToWindow) {
                windowManager.removeView(it)
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/receiver/BootReceiver.kt',
    name: 'BootReceiver.kt',
    language: 'kotlin',
    category: 'kotlin_service',
    content: `package com.floating2fa.app.receiver

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

            // Only launch if user enabled bubble and overlay permission is granted
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
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin_ui',
    content: `package com.floating2fa.app.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import com.floating2fa.app.service.FloatingBubbleService
import com.floating2fa.app.ui.screens.MainAppNavGraph
import com.floating2fa.app.ui.theme.Floating2FATheme
import com.floating2fa.app.ui.viewmodel.TotpViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private val viewModel: TotpViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Parse deep link otpauth:// if opened from QR scan or browser
        intent?.data?.let { uri ->
            if (uri.scheme == "otpauth" && uri.host == "totp") {
                viewModel.importOtpAuthUri(uri.toString())
            }
        }

        setContent {
            Floating2FATheme(darkTheme = isSystemInDarkTheme()) {
                MainAppNavGraph(
                    viewModel = viewModel,
                    onRequestOverlayPermission = { requestOverlayPermission() },
                    onToggleFloatingBubble = { enable -> toggleBubbleService(enable) },
                    onAuthenticateBiometric = { onSuccess, onError ->
                        promptBiometric(onSuccess, onError)
                    }
                )
            }
        }
    }

    private fun requestOverlayPermission() {
        if (!Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:\$packageName")
            )
            startActivity(intent)
        }
    }

    private fun toggleBubbleService(enable: Boolean) {
        val intent = Intent(this, FloatingBubbleService::class.java)
        if (enable && Settings.canDrawOverlays(this)) {
            startForegroundService(intent)
        } else {
            stopService(intent)
        }
    }

    private fun promptBiometric(onSuccess: () -> Unit, onError: (String) -> Unit) {
        val executor = ContextCompat.getMainExecutor(this)
        val prompt = BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errString.toString())
            }
        })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock Floating 2FA")
            .setSubtitle("Confirm your fingerprint or face to view tokens")
            .setNegativeButtonText("Use PIN")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
            .build()

        prompt.authenticate(promptInfo)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/floating2fa/app/ui/overlay/FloatingOverlayContent.kt',
    name: 'FloatingOverlayContent.kt',
    language: 'kotlin',
    category: 'kotlin_ui',
    content: `package com.floating2fa.app.ui.overlay

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Launch
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.floating2fa.app.data.repository.Account
import com.floating2fa.app.data.repository.AccountRepository
import com.floating2fa.app.data.totp.TotpGenerator
import kotlinx.coroutines.delay

@Composable
fun FloatingOverlayContent(
    repository: AccountRepository,
    onClose: () -> Unit,
    onOpenApp: () -> Unit,
    onCopyCode: (String) -> Unit
) {
    val accounts by repository.getAccounts().collectAsState(initial = emptyList())

    // Ticker to refresh codes every second
    var currentTime by remember { mutableStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = System.currentTimeMillis()
            delay(1000)
        }
    }

    val periodState = TotpGenerator.getPeriodState(currentTime)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .wrapContentHeight(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header with circular countdown and actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(32.dp)) {
                        CircularProgressIndicator(
                            progress = { periodState.progress },
                            modifier = Modifier.fillMaxSize(),
                            color = if (periodState.isUrgent) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                            strokeWidth = 3.dp,
                            trackColor = MaterialTheme.colorScheme.outlineVariant
                        )
                        Text(
                            text = "\${periodState.secondsRemaining}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (periodState.isUrgent) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Floating 2FA",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row {
                    IconButton(onClick = onOpenApp, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Launch, contentDescription = "Open App", modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onClose, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (accounts.isEmpty()) {
                Text(
                    text = "No accounts yet. Open app to add.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                LazyColumn(modifier = Modifier.heightIn(max = 260.dp)) {
                    items(accounts, key = { it.id }) { account ->
                        val code = TotpGenerator.generateOtp(account.secret, currentTime)
                        val formattedCode = "\${code.substring(0, 3)} \${code.substring(3)}"

                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onCopyCode(code) },
                            color = MaterialTheme.colorScheme.surface,
                            tonalElevation = 2.dp
                        ) {
                            Row(
                                modifier = Modifier
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                                    .fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = account.issuer,
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = formattedCode,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (periodState.isUrgent) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                                    )
                                }
                                Icon(
                                    Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml (English)',
    language: 'xml',
    category: 'res',
    content: `<resources>
    <string name="app_name">Floating 2FA</string>
    <string name="bubble_notification_title">Floating 2FA is active</string>
    <string name="bubble_notification_desc">Tap floating bubble to access your verification codes</string>
    <string name="copied_to_clipboard">Code copied to clipboard!</string>
    <string name="overlay_permission_title">Overlay Permission Required</string>
    <string name="overlay_permission_desc">Allow Floating 2FA to display over other apps so you can access codes without switching windows.</string>
    <string name="grant_permission">Grant Permission</string>
    <string name="add_account">Add Account</string>
    <string name="scan_qr">Scan QR Code</string>
    <string name="manual_entry">Manual Key Entry</string>
</resources>`,
  },
  {
    path: 'app/src/main/res/values-bn/strings.xml',
    name: 'strings.xml (Bengali - বাংলা)',
    language: 'xml',
    category: 'res',
    content: `<resources>
    <string name="app_name">ফ্লোটিং ২এফএ</string>
    <string name="bubble_notification_title">ফ্লোটিং ২এফএ সক্রিয় আছে</string>
    <string name="bubble_notification_desc">ভেরিফিকেশন কোড দেখতে ভাসমান বাবলে চাপুন</string>
    <string name="copied_to_clipboard">কোড ক্লিপবোর্ডে কপি করা হয়েছে!</string>
    <string name="overlay_permission_title">ওভারলে পারমিশন প্রয়োজন</string>
    <string name="overlay_permission_desc">অন্য অ্যাপের উপরে ২এফএ কোড দেখতে "Display over other apps" পারমিশন দিন।</string>
    <string name="grant_permission">অনুমতি দিন</string>
    <string name="add_account">অ্যাকাউন্ট যোগ করুন</string>
    <string name="scan_qr">কিউআর কোড স্ক্যান</string>
    <string name="manual_entry">কী টাইপ করুন</string>
</resources>`,
  },
  {
    path: 'README.md',
    name: 'README.md (Setup Guide)',
    language: 'markdown',
    category: 'docs',
    content: `# Floating 2FA - Native Android Authenticator

A modern native Android 2FA authenticator built with **Kotlin**, **Jetpack Compose (Material 3)**, **Room Database**, **Android Keystore AES-GCM**, and a **WindowManager Floating Overlay Bubble**.

---

## 🚀 Key Features

1. **RFC 6238 TOTP**: 6-digit codes, 30s period, SHA1. Monospace display ("123 456"), countdown ring, red warning in last 5 seconds.
2. **56dp Floating Bubble**: Overlays all Android apps using \`SYSTEM_ALERT_WINDOW\` and a Foreground Service with notification.
3. **Physics Snap-to-Edge**: Draggable anywhere, smoothly snaps to nearest screen edge with overshoot interpolation.
4. **300dp Expandable Overlay**: Tap bubble to open mini Compose card, view live codes, tap-to-copy with haptic feedback.
5. **CameraX + ML Kit Scanner**: Live QR code scanner for \`otpauth://totp/...\` URIs.
6. **Encrypted Storage**: Secrets encrypted using AES-GCM 256-bit keys inside Android Keystore.
7. **BiometricPrompt**: Optional fingerprint and face unlock protection.
8. **Reboot Persistence**: Auto-starts bubble service on \`BOOT_COMPLETED\`.
9. **Dual Language**: Complete English and Bengali (বাংলা) localization.

---

## 🛠️ How to Import into Android Studio

1. **Download Project ZIP**:
   Click the **"Download Android Studio Project (.ZIP)"** button in the web inspector or extract the files.
2. **Open in Android Studio**:
   - Open Android Studio (Hedgehog 2023.1.1 or Ladybug 2024.2+).
   - Click **File > Open** and select the extracted folder.
   - Wait for **Gradle Sync** to finish.
3. **Permissions to Grant on Device**:
   - **Display over other apps**: Go to *Settings > Apps > Floating 2FA > Display over other apps > Allow*.
   - **Camera**: Required for QR scanning.
   - **Notifications**: Required on Android 13+ (\`POST_NOTIFICATIONS\`) for the persistent Foreground Service.
4. **OEM Quirks (Xiaomi MIUI / HyperOS, Vivo, Oppo, Huawei)**:
   - On Xiaomi/Redmi devices, grant **"Display pop-up windows while running in the background"** in *App Info > Other Permissions*.
   - Disable **Battery Optimization** (Set to "No Restrictions") so Android does not kill the foreground service.
5. **Run**:
   Connect your physical device or start an emulator running API 26+ and click **Run 'app'** (\`Shift + F10\`).
`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (Free Cloud APK Builder)',
    language: 'yaml',
    category: 'ci',
    content: `name: Build Floating 2FA Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Validate Gradle Wrapper
      uses: gradle/actions/wrapper-validation@v3

    - name: Build Debug APK
      run: ./gradlew assembleDebug --stacktrace

    - name: Upload Debug APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: Floating-2FA-Debug-APK
        path: app/build/outputs/apk/debug/*.apk
`,
  },
];
