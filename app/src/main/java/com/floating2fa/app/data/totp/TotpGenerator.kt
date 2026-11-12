package com.floating2fa.app.data.totp

import java.nio.ByteBuffer
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.math.pow

object TotpGenerator {

    private const val HMAC_SHA1 = "HmacSHA1"

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
            String.format("%0${digits}d", code)
        } catch (e: Exception) {
            "000000"
        }
    }

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
}
