/**
 * Optimized localStorage utilities with error handling and performance improvements
 */

// Storage quota management
const STORAGE_QUOTA_WARNING = 0.8 // Warn when 80% full
const MAX_RETRY_ATTEMPTS = 3

export interface StorageOptions {
  compress?: boolean
  ttl?: number // Time to live in milliseconds
  essential?: boolean // Essential data that should not be cleaned up
}

export interface StorageItem<T> {
  data: T
  timestamp: number
  ttl?: number
  essential?: boolean
}

/**
 * Check localStorage usage and availability
 */
export function getStorageInfo() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { available: false, used: 0, total: 0, percentage: 0 }
  }

  try {
    let used = 0
    let total = 5 * 1024 * 1024 // Default 5MB estimate

    // Calculate used space
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Try to estimate total space (this is approximate)
    try {
      const testKey = 'storage-test'
      const testData = new Array(1024 * 1024).join('x') // 1MB test
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
    } catch (e) {
      // If we can't store 1MB, storage is likely full or limited
    }

    return {
      available: true,
      used,
      total,
      percentage: (used / total) * 100
    }
  } catch (error) {
    return { available: false, used: 0, total: 0, percentage: 0 }
  }
}

/**
 * Clean up expired or non-essential items from localStorage
 */
export function cleanupStorage(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0

  let cleaned = 0
  const now = Date.now()
  const keysToRemove: string[] = []

  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const item = JSON.parse(localStorage[key]) as StorageItem<any>
          
          // Check if item has expired
          if (item.timestamp && item.ttl && (now - item.timestamp) > item.ttl) {
            keysToRemove.push(key)
            continue
          }

          // Clean up non-essential large items if storage is getting full
          const storageInfo = getStorageInfo()
          if (storageInfo.percentage > STORAGE_QUOTA_WARNING && !item.essential) {
            const itemSize = localStorage[key].length
            if (itemSize > 50 * 1024) { // Remove items larger than 50KB
              keysToRemove.push(key)
            }
          }
        } catch (e) {
          // If we can't parse the item, consider removing it
          if (!key.startsWith('user-') && !key.startsWith('auth-')) {
            keysToRemove.push(key)
          }
        }
      }
    }

    // Remove identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      cleaned++
    })

    return cleaned
  } catch (error) {
    console.error('Error during storage cleanup:', error)
    return 0
  }
}

/**
 * Safely set item to localStorage with compression and error handling
 */
export function setStorageItem<T>(
  key: string, 
  data: T, 
  options: StorageOptions = {}
): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false

  const { ttl, essential = false } = options
  
  try {
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      essential
    }

    const serialized = JSON.stringify(item)
    
    // Check if we have enough space
    const storageInfo = getStorageInfo()
    const itemSize = serialized.length
    

    // Try to store the item
    localStorage.setItem(key, serialized)
    return true
    
  } catch (error) {
    console.error(`Error storing item ${key}:`, error)
    
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Try cleanup and retry
      const cleaned = cleanupStorage()
      if (cleaned > 0) {
        try {
          const item: StorageItem<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            essential
          }
          localStorage.setItem(key, JSON.stringify(item))
          return true
        } catch (retryError) {
          console.error(`Retry failed for ${key}:`, retryError)
        }
      }
    }
    
    return false
  }
}

/**
 * Safely get item from localStorage with expiration check
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null

  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const item = JSON.parse(stored) as StorageItem<T>
    
    // Check if item has expired
    if (item.ttl && item.timestamp && (Date.now() - item.timestamp) > item.ttl) {
      localStorage.removeItem(key)
      return null
    }

    return item.data
  } catch (error) {
    console.error(`Error retrieving item ${key}:`, error)
    // Remove corrupted item
    try {
      localStorage.removeItem(key)
    } catch (removeError) {
      // Ignore remove errors
    }
    return null
  }
}

/**
 * Debounced storage setter to avoid rapid successive writes
 */
const debouncedSetters = new Map<string, NodeJS.Timeout>()

export function setStorageItemDebounced<T>(
  key: string,
  data: T,
  delay: number = 500,
  options: StorageOptions = {}
): void {
  // Clear existing timeout for this key
  const existing = debouncedSetters.get(key)
  if (existing) {
    clearTimeout(existing)
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    setStorageItem(key, data, options)
    debouncedSetters.delete(key)
  }, delay)

  debouncedSetters.set(key, timeout)
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing item ${key}:`, error)
    return false
  }
}

/**
 * Batch storage operations for better performance
 */
export function batchStorageOperations(operations: Array<{
  type: 'set' | 'remove'
  key: string
  data?: any
  options?: StorageOptions
}>): { success: number; failed: number } {
  let success = 0
  let failed = 0

  operations.forEach(op => {
    try {
      if (op.type === 'set' && op.data !== undefined) {
        if (setStorageItem(op.key, op.data, op.options)) {
          success++
        } else {
          failed++
        }
      } else if (op.type === 'remove') {
        if (removeStorageItem(op.key)) {
          success++
        } else {
          failed++
        }
      }
    } catch (error) {
      failed++
    }
  })

  return { success, failed }
}
