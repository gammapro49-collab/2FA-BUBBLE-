package com.floating2fa.app.data.repository

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
    val secret: String,
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
}
