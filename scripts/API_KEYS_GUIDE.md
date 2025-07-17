# API Keys Management Guide

## Overview

This guide explains how to use the API keys system that stores encrypted API keys in the database instead of environment variables for better security and management.

## Table Structure

The `api_keys` table contains:
- `id`: UUID primary key
- `service_name`: Name of the service (e.g., 'gemini')
- `key_name`: Unique identifier for the key
- `encrypted_key`: Encrypted API key
- `is_active`: Whether the key is active
- `usage_limit`: Daily usage limit
- `current_usage`: Current usage count
- `expires_at`: Expiration date (optional)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Migration Script

### Running the Migration

1. **First-time migration:**
   ```bash
   node scripts/migrate-api-keys.js
   ```

2. **Force migration (overwrites existing):**
   ```bash
   node scripts/migrate-api-keys.js --force
   ```

### What the Script Does

1. Extracts all Gemini API keys from `.env` file
2. Encrypts each key using AES encryption
3. Stores them in the `api_keys` table with metadata
4. Sets default usage limits and active status

## Using API Keys in Your Application

### 1. Create API Key Service

Create `lib/api-keys.ts`:

```typescript
import { supabase } from './supabase'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

// Decrypt API key
function decryptApiKey(encryptedKey: string): string {
  const decipher = crypto.createDecipher('aes192', ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Get active API key for a service
export async function getApiKey(serviceName: string, keyName?: string) {
  const query = supabase
    .from('api_keys')
    .select('*')
    .eq('service_name', serviceName)
    .eq('is_active', true)

  if (keyName) {
    query.eq('key_name', keyName)
  }

  const { data, error } = await query.order('current_usage', { ascending: true }).limit(1)

  if (error || !data || data.length === 0) {
    throw new Error(`No active API key found for service: ${serviceName}`)
  }

  const apiKey = data[0]
  
  // Check usage limit
  if (apiKey.usage_limit && apiKey.current_usage >= apiKey.usage_limit) {
    throw new Error(`API key ${apiKey.key_name} has reached usage limit`)
  }

  return {
    ...apiKey,
    decrypted_key: decryptApiKey(apiKey.encrypted_key)
  }
}

// Increment usage counter
export async function incrementApiKeyUsage(keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ 
      current_usage: supabase.raw('current_usage + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('id', keyId)

  if (error) {
    console.error('Failed to increment API key usage:', error)
  }
}

// Reset daily usage (call this in a cron job)
export async function resetDailyUsage() {
  const { error } = await supabase
    .from('api_keys')
    .update({ 
      current_usage: 0,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to reset daily usage:', error)
  }
}

// Get all API keys for management
export async function getAllApiKeys(serviceName?: string) {
  const query = supabase
    .from('api_keys')
    .select('id, service_name, key_name, is_active, usage_limit, current_usage, expires_at, created_at')

  if (serviceName) {
    query.eq('service_name', serviceName)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`)
  }

  return data
}
```

### 2. Update Gemini AI Service

Update your Gemini service to use database keys:

```typescript
// lib/gemini-api.ts
import { getApiKey, incrementApiKeyUsage } from './api-keys'

export async function createGeminiClient() {
  try {
    // Get an active Gemini API key
    const apiKeyData = await getApiKey('gemini')
    
    // Create Gemini client with the decrypted key
    const client = new GoogleGenerativeAI(apiKeyData.decrypted_key)
    
    // Increment usage counter
    await incrementApiKeyUsage(apiKeyData.id)
    
    return {
      client,
      keyInfo: {
        id: apiKeyData.id,
        name: apiKeyData.key_name,
        usage: apiKeyData.current_usage,
        limit: apiKeyData.usage_limit
      }
    }
  } catch (error) {
    console.error('Failed to create Gemini client:', error)
    throw error
  }
}
```

### 3. Create API Key Management Dashboard

Create an admin interface to manage API keys:

```typescript
// components/admin/api-keys-dashboard.tsx
import { useState, useEffect } from 'react'
import { getAllApiKeys } from '@/lib/api-keys'

export function ApiKeysDashboard() {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const keys = await getAllApiKeys()
      setApiKeys(keys)
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">API Keys Management</h2>
      
      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <div key={key.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{key.key_name}</h3>
                <p className="text-sm text-gray-600">{key.service_name}</p>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  Usage: {key.current_usage} / {key.usage_limit || '∞'}
                </div>
                <div className={`text-xs ${key.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {key.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Security Best Practices

### 1. Environment Variables

Keep these secure environment variables:
```env
# Add to .env (keep secret!)
API_ENCRYPTION_KEY=your-secure-encryption-key-here
```

### 2. Database Security

- Enable Row Level Security (RLS) on `api_keys` table
- Restrict access to admin users only
- Audit API key access and usage

### 3. Key Rotation

Set up automated key rotation:
```sql
-- Create function to rotate keys
CREATE OR REPLACE FUNCTION rotate_api_key(key_id UUID, new_encrypted_key TEXT)
RETURNS void AS $$
BEGIN
  UPDATE api_keys 
  SET 
    encrypted_key = new_encrypted_key,
    current_usage = 0,
    updated_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql;
```

## Monitoring and Alerts

### 1. Usage Monitoring

Create alerts for:
- Keys reaching usage limits
- Failed API calls
- Inactive keys being used

### 2. Daily Reset Cron Job

```typescript
// pages/api/cron/reset-api-usage.ts
import { resetDailyUsage } from '@/lib/api-keys'

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    await resetDailyUsage()
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

## Troubleshooting

### Common Issues

1. **"No active API key found"**
   - Check if keys are marked as `is_active = true`
   - Verify service name matches exactly

2. **"API key has reached usage limit"**
   - Check current usage vs limit
   - Reset usage or increase limit

3. **Decryption errors**
   - Verify `API_ENCRYPTION_KEY` matches the one used for encryption
   - Check if encrypted_key is corrupted

### Useful SQL Queries

```sql
-- Check API key status
SELECT key_name, is_active, current_usage, usage_limit 
FROM api_keys 
WHERE service_name = 'gemini';

-- Reset usage for all keys
UPDATE api_keys SET current_usage = 0;

-- Activate/deactivate key
UPDATE api_keys SET is_active = true WHERE key_name = 'gemini-key-1';
```

## Next Steps

1. Run the migration script to import your keys
2. Update your Gemini service to use the database keys
3. Remove API keys from .env file
4. Set up monitoring and alerts
5. Implement key rotation strategy
6. Create admin dashboard for key management

---

**Note:** Always backup your database before running migrations and test in development first!
