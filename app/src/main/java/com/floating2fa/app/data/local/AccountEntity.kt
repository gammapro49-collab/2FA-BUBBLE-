package com.floating2fa.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "totp_accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    val issuer: String,
    val accountName: String,
    val encryptedSecret: String,
    val digits: Int = 6,
    val period: Int = 30,
    val algorithm: String = "SHA1",
    val colorHex: String = "#4285F4",
    val createdAt: Long = System.currentTimeMillis()
)
