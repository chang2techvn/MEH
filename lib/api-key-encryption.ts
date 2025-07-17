/**
 * API Key Encryption/Decryption Utilities
 * Handles secure encryption and decryption of API keys using AES-192-CBC
 */

import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-192-cbc'
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'
const IV_LENGTH = 16

/**
 * Encrypts an API key using AES-192-CBC encryption
 * @param apiKey - The plain text API key to encrypt
 * @returns The encrypted key as a hex string
 */
export function encryptApiKey(apiKey: string): string {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Derive key from the encryption key
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    
    // Create the cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    // Encrypt the API key
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('❌ Error encrypting API key:', error)
    throw new Error('Failed to encrypt API key')
  }
}

/**
 * Decrypts an API key using AES-192-CBC decryption
 * @param encryptedKey - The encrypted key as a hex string
 * @returns The decrypted plain text API key
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    // Handle legacy encryption format (migration script format)
    if (!encryptedKey.includes(':')) {
      // Legacy format - use fixed IV like migration script
      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
      const iv = Buffer.alloc(16, 0) // Fixed IV matching migration
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
    
    // New format with IV (for future encryption)
    const [ivHex, encrypted] = encryptedKey.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    
    // Create the decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    // Decrypt the API key
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('❌ Error decrypting API key:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Validates if an API key format is correct
 * @param apiKey - The API key to validate
 * @returns True if the key format is valid
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Gemini API keys start with AIza and are typically 39 characters
  const geminiPattern = /^AIza[a-zA-Z0-9_-]{35}$/
  
  return geminiPattern.test(apiKey)
}

/**
 * Masks an API key for safe logging
 * @param apiKey - The API key to mask
 * @returns The masked key (shows first 10 and last 3 characters)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 13) {
    return '*'.repeat(apiKey.length)
  }
  
  const start = apiKey.substring(0, 10)
  const end = apiKey.substring(apiKey.length - 3)
  const middle = '*'.repeat(apiKey.length - 13)
  
  return `${start}${middle}${end}`
}

/**
 * Generates a secure encryption key for production use
 * @returns A secure random encryption key
 */
export function generateSecureEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Rotates the encryption key (for enhanced security)
 * NOTE: This requires re-encrypting all existing keys in the database
 * @param oldKey - The old encryption key
 * @param newKey - The new encryption key
 * @param encryptedData - The data encrypted with the old key
 * @returns The data encrypted with the new key
 */
export function rotateEncryptionKey(
  oldKey: string,
  newKey: string,
  encryptedData: string
): string {
  // Decrypt with old key
  const originalEncryptionKey = ENCRYPTION_KEY
  
  // Temporarily use old key
  Object.defineProperty(module.exports, 'ENCRYPTION_KEY', { value: oldKey })
  const decrypted = decryptApiKey(encryptedData)
  
  // Use new key for encryption
  Object.defineProperty(module.exports, 'ENCRYPTION_KEY', { value: newKey })
  const reencrypted = encryptApiKey(decrypted)
  
  // Restore original key
  Object.defineProperty(module.exports, 'ENCRYPTION_KEY', { value: originalEncryptionKey })
  
  return reencrypted
}
