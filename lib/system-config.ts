import { supabase } from './supabase'
import type { SystemConfig, SystemConfigKey, DefaultAssistantConfig } from '@/types/system-config.types'

class SystemConfigService {
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get system configuration by key
   */
  async getConfig<T = any>(key: SystemConfigKey): Promise<T | null> {
    try {
      // Check cache first
      const cached = this.getFromCache<T>(key)
      if (cached !== null) {
        return cached
      }

      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error(`Error fetching system config for key ${key}:`, error)
        return null
      }

      if (!data) {
        return null
      }

      // Cache the result
      this.setCache(key, data.config_value)
      return data.config_value as T
    } catch (error) {
      console.error(`Error in getConfig for key ${key}:`, error)
      return null
    }
  }

  /**
   * Update system configuration (upsert)
   */
  async updateConfig(key: SystemConfigKey, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          config_key: key,
          config_value: value,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'config_key'
        })

      if (error) {
        console.error(`Error updating system config for key ${key}:`, error)
        return false
      }

      // Update cache
      this.setCache(key, value)
      return true
    } catch (error) {
      console.error(`Error in updateConfig for key ${key}:`, error)
      return false
    }
  }

  /**
   * Get default assistant configuration
   */
  async getDefaultAssistant(): Promise<DefaultAssistantConfig> {
    console.log('🔍 SystemConfigService: Getting default assistant config...')
    const config = await this.getConfig<DefaultAssistantConfig>('default_assistant')
    
    console.log('📄 SystemConfigService: Config from database:', config)
    
    // Fallback to hardcoded values if config not found
    if (!config) {
      console.log('⚠️ SystemConfigService: No config found, using fallback')
      return {
        id: 'hani-default',
        name: 'Hani',
        avatar: 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif',
        role: 'Assistant',
        field: 'Assistant',
        prompt: 'You are Hani, a friendly AI assistant specialized in English learning. You help students improve their English skills through conversation, grammar correction, vocabulary building, and providing helpful explanations. Always be encouraging, patient, and provide clear examples.',
        model: 'gemini-2.5-flash'
      }
    }

    console.log('✅ SystemConfigService: Using database config')
    return config
  }

  /**
   * Update default assistant configuration
   */
  async updateDefaultAssistant(config: DefaultAssistantConfig): Promise<boolean> {
    return this.updateConfig('default_assistant', config)
  }



  /**
   * Get value from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key)
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }
    return this.cache.get(key) || null
  }

  /**
   * Set value in cache with expiry
   */
  private setCache(key: string, value: any): void {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION)
  }

  /**
   * Clear all cache (useful for debugging)
   */
  clearCache(): void {
    console.log('🗑️ SystemConfigService: Clearing cache...')
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  /**
   * Clear specific cache key
   */
  clearCacheKey(key: string): void {
    console.log(`🗑️ SystemConfigService: Clearing cache for key: ${key}`)
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }
}

// Export singleton instance
export const systemConfigService = new SystemConfigService()
export default systemConfigService
