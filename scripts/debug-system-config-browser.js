/**
 * Debug script to test system config in browser console
 * Usage: Copy this code and run in browser console
 */

// Clear cache and test again
window.debugSystemConfig = async function() {
  try {
    // Import system config service
    const { systemConfigService } = await import('./lib/system-config')
    
    console.log('🧪 Debug: Clearing cache...')
    systemConfigService.clearCache()
    
    console.log('🧪 Debug: Testing getDefaultAssistant...')
    const result = await systemConfigService.getDefaultAssistant()
    
    console.log('🧪 Debug result:', result)
    return result
  } catch (error) {
    console.error('🧪 Debug error:', error)
  }
}

// Also export for manual testing
if (typeof window !== 'undefined') {
  window.clearSystemConfigCache = async () => {
    const { systemConfigService } = await import('./lib/system-config')
    systemConfigService.clearCache()
    console.log('✅ System config cache cleared!')
  }
}
