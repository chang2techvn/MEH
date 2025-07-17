/**
 * TypeScript interfaces for API Keys Management System
 * Provides type safety for all API key operations
 */

export interface ApiKey {
  id: string
  service_name: string
  key_name: string
  encrypted_key: string
  is_active: boolean
  usage_limit: number
  current_usage: number
  expires_at?: string | null
  created_at: string
  updated_at: string
}

export interface ApiKeyDecrypted extends Omit<ApiKey, 'encrypted_key'> {
  decrypted_key: string
}

export interface ApiKeyUsage {
  keyId: string
  keyName: string
  currentUsage: number
  usageLimit: number
  usagePercentage: number
  isNearLimit: boolean
}

export interface ApiKeyHealth {
  keyId: string
  keyName: string
  isActive: boolean
  isHealthy: boolean
  lastChecked: Date
  errorCount: number
  lastError?: string
}

export interface ApiKeyServiceConfig {
  serviceName: string
  maxRetries: number
  retryDelay: number
  healthCheckInterval: number
  usageThreshold: number
}

export interface ApiKeyRotationResult {
  success: boolean
  previousKeyId?: string
  newKeyId?: string
  reason: string
  timestamp: Date
}

export interface ApiKeyError extends Error {
  code: 'KEY_NOT_FOUND' | 'DECRYPTION_FAILED' | 'QUOTA_EXCEEDED' | 'SERVICE_UNAVAILABLE' | 'DATABASE_ERROR'
  keyId?: string
  serviceName?: string
  details?: any
}

export type ApiKeyStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'QUOTA_EXCEEDED' | 'ERROR'

export interface ApiKeyMetrics {
  totalKeys: number
  activeKeys: number
  inactiveKeys: number
  totalUsage: number
  averageUsage: number
  errorRate: number
  healthyKeys: number
}
