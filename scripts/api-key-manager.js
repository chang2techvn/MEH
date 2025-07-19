/**
 * JavaScript version of API Key Manager for test scripts
 * Contains the essential functions needed for testing
 */

const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

// Encryption configuration
const ALGORITHM = 'aes-192-cbc'
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Decrypts an API key using AES-192-CBC decryption
 */
function decryptApiKey(encryptedKey) {
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
 * Gets an active API key for the specified service
 */
async function getActiveApiKey(serviceName = 'gemini') {
  try {
    console.log(`🔑 Getting active API key for service: ${serviceName}`)
    
    // Query for active keys, ordered by usage (lowest first) and creation date
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
    
    if (error) {
      console.error('❌ Database error:', error)
      throw new Error('Failed to fetch API key from database')
    }
    
    if (!keys || keys.length === 0) {
      console.error(`❌ No active API keys found for service: ${serviceName}`)
      throw new Error(`No active API keys available for service: ${serviceName}`)
    }
    
    const key = keys[0]
    
    try {
      // Decrypt the API key
      const decryptedKey = decryptApiKey(key.encrypted_key)
      
      console.log(`✅ Retrieved active API key: ${key.key_name} (Usage: ${key.current_usage}/${key.usage_limit})`)
      
      return {
        ...key,
        decrypted_key: decryptedKey
      }
    } catch (decryptError) {
      console.error(`❌ Failed to decrypt API key ${key.key_name}:`, decryptError)
      throw new Error('Failed to decrypt API key')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in getActiveApiKey:', error)
    throw error
  }
}

/**
 * Marks an API key as inactive
 */
async function markKeyAsInactive(keyId, reason) {
  try {
    console.log(`🚫 Marking API key as inactive: ${keyId} - Reason: ${reason}`)
    
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      console.error('❌ Failed to mark key as inactive:', error)
      throw new Error('Failed to update key status')
    }
    
    console.log(`✅ API key marked as inactive: ${keyId}`)
    return true
    
  } catch (error) {
    console.error('❌ Error marking key as inactive:', error)
    return false
  }
}

/**
 * Increments the usage counter for an API key
 */
async function incrementUsage(keyId) {
  try {
    console.log(`📊 Incrementing usage for API key: ${keyId}`)
    
    // First get current usage
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('id', keyId)
      .single()
    
    if (fetchError || !currentKey) {
      console.error('❌ Failed to fetch current usage:', fetchError)
      throw new Error('Failed to fetch current usage')
    }
    
    // Update with incremented value
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: currentKey.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      console.error('❌ Failed to increment usage:', error)
      throw new Error('Failed to update usage counter')
    }
    
    console.log(`✅ Usage incremented for API key: ${keyId}`)
    return true
    
  } catch (error) {
    console.error('❌ Error incrementing usage:', error)
    return false
  }
}

module.exports = {
  getActiveApiKey,
  incrementUsage,
  markKeyAsInactive
}
