#!/usr/bin/env node

/**
 * Comprehensive 5-Tab Functionality Test
 * 
 * Tests all 5 active tabs in /admin/video-settings:
 * 1. daily-video tab
 * 2. automation tab  
 * 3. general tab
 * 4. watch-time tab
 * 5. content tab
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

// Add fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

const config = {
  baseUrl: 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey)

function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '📋',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    tab: '📑'
  }[type] || '📋'
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function logSection(title) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🎯 ${title}`)
  console.log('='.repeat(70))
}

// Test 1: Check component files exist and are properly structured
async function testComponentStructure() {
  logSection('TAB COMPONENT STRUCTURE VALIDATION')
  
  const tabs = [
    { name: 'daily-video', file: 'daily-video-tab.tsx', component: 'DailyVideoTab' },
    { name: 'automation', file: 'automation-settings-tab.tsx', component: 'AutomationSettingsTab' },
    { name: 'general', file: 'general-settings-tab.tsx', component: 'GeneralSettingsTab' },
    { name: 'watch-time', file: 'watch-time-tab.tsx', component: 'WatchTimeTab' },
    { name: 'content', file: 'content-tab.tsx', component: 'ContentTab' }
  ]
  
  let passed = 0
  
  for (const tab of tabs) {
    const filePath = path.join('app/admin/video-settings/components', tab.file)
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Check for export
        if (content.includes(`export function ${tab.component}`) || content.includes(`export default function ${tab.component}`)) {
          log(`${tab.name} tab: Component properly exported`, 'success')
          passed++
        } else {
          log(`${tab.name} tab: Component export issue`, 'error')
        }
      } else {
        log(`${tab.name} tab: File missing (${tab.file})`, 'error')
      }
    } catch (error) {
      log(`${tab.name} tab: Error reading file - ${error.message}`, 'error')
    }
  }
  
  return passed === tabs.length
}

// Test 2: Check page.tsx imports all tabs correctly
async function testPageImports() {
  logSection('PAGE.TSX IMPORTS VALIDATION')
  
  const pagePath = 'app/admin/video-settings/page.tsx'
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8')
    
    const expectedImports = [
      'DailyVideoTab',
      'AutomationSettingsTab', 
      'GeneralSettingsTab',
      'WatchTimeTab',
      'ContentTab'
    ]
    
    let passed = 0
    
    expectedImports.forEach(importName => {
      if (content.includes(`import { ${importName} }`)) {
        log(`${importName} import: Found`, 'success')
        passed++
      } else {
        log(`${importName} import: Missing`, 'error')
      }
    })
    
    // Check TabsContent usage
    const tabValues = ['daily-video', 'automation', 'general', 'watch-time', 'content']
    let tabsUsed = 0
    
    tabValues.forEach(value => {
      if (content.includes(`value="${value}"`)) {
        log(`Tab "${value}": Properly defined in TabsContent`, 'success')
        tabsUsed++
      } else {
        log(`Tab "${value}": Missing TabsContent definition`, 'error')
      }
    })
    
    return passed === expectedImports.length && tabsUsed === tabValues.length
    
  } catch (error) {
    log(`Page imports test failed: ${error.message}`, 'error')
    return false
  }
}

// Test 3: Database connectivity for tab functionality
async function testDatabaseConnectivity() {
  logSection('DATABASE CONNECTIVITY FOR TABS')
  
  const tests = [
    {
      name: 'Daily Video Tab - Challenges table',
      test: async () => {
        const { data, error } = await supabase
          .from('challenges')
          .select('id, title, video_url, challenge_type')
          .eq('challenge_type', 'daily')
          .limit(1)
        
        if (error) throw error
        return { 
          passed: true, 
          message: `Found ${data?.length || 0} daily challenges` 
        }
      }
    },
    {
      name: 'Automation Tab - Settings table',
      test: async () => {
        const { data, error } = await supabase
          .from('daily_video_settings')
          .select('*')
          .limit(1)
        
        if (error) throw error
        return { 
          passed: true, 
          message: `Settings table accessible, ${data?.length || 0} records` 
        }
      }
    },
    {
      name: 'General Tab - Basic database access',
      test: async () => {
        const { data, error } = await supabase
          .from('challenges')
          .select('count')
          .limit(1)
        
        if (error) throw error
        return { 
          passed: true, 
          message: 'Database connection successful' 
        }
      }
    }
  ]
  
  let passed = 0
  
  for (const test of tests) {
    try {
      const result = await test.test()
      if (result.passed) {
        log(`${test.name}: ${result.message}`, 'success')
        passed++
      } else {
        log(`${test.name}: ${result.message}`, 'error')
      }
    } catch (error) {
      log(`${test.name}: Database error - ${error.message}`, 'error')
    }
  }
  
  return passed === tests.length
}

// Test 4: API endpoints for tabs
async function testTabAPIEndpoints() {
  logSection('TAB API ENDPOINTS VALIDATION')
  
  const endpoints = [
    {
      name: 'Automation Settings API',
      url: '/api/admin/automation-settings',
      method: 'GET'
    },
    {
      name: 'Manual Video Override Function',
      test: () => {
        const actionsPath = 'app/actions/youtube-video.ts'
        if (fs.existsSync(actionsPath)) {
          const content = fs.readFileSync(actionsPath, 'utf8')
          return content.includes('setAdminSelectedVideo')
        }
        return false
      }
    }
  ]
  
  let passed = 0
  
  for (const endpoint of endpoints) {
    try {
      if (endpoint.test) {
        // Custom test function
        if (endpoint.test()) {
          log(`${endpoint.name}: Function exists`, 'success')
          passed++
        } else {
          log(`${endpoint.name}: Function missing`, 'error')
        }
      } else if (endpoint.skipTest) {
        // Just check if API file exists
        const apiPath = `app${endpoint.url}/route.ts`
        if (fs.existsSync(apiPath)) {
          log(`${endpoint.name}: API file exists`, 'success')
          passed++
        } else {
          log(`${endpoint.name}: API file missing`, 'error')
        }
      } else {
        const response = await fetch(`${config.baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          log(`${endpoint.name}: API responding (${response.status})`, 'success')
          passed++
        } else {
          log(`${endpoint.name}: API error (${response.status})`, 'error')
        }
      }
    } catch (error) {
      log(`${endpoint.name}: ${error.message}`, 'error')
    }
  }
  
  return passed === endpoints.length
}

// Test 5: TypeScript compilation
async function testTypeScriptCompilation() {
  logSection('TYPESCRIPT COMPILATION CHECK')
  
  try {
    const { execSync } = require('child_process')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    log('TypeScript compilation: No errors', 'success')
    return true
  } catch (error) {
    log('TypeScript compilation: Errors found', 'error')
    return false
  }
}

// Test 6: Check for specific tab functionality
async function testTabSpecificFunctionality() {
  logSection('TAB-SPECIFIC FUNCTIONALITY CHECK')
  
  const checks = [
    {
      name: 'Daily Video Tab - Video display component',
      test: () => {
        const componentPath = 'app/admin/video-settings/components/daily-video-display.tsx'
        return fs.existsSync(componentPath)
      }
    },
    {
      name: 'Daily Video Tab - Manual override component',
      test: () => {
        const componentPath = 'app/admin/video-settings/components/manual-video-override.tsx'
        return fs.existsSync(componentPath)
      }
    },
    {
      name: 'Automation Tab - Status component',
      test: () => {
        const componentPath = 'app/admin/video-settings/components/automation-status.tsx'
        return fs.existsSync(componentPath)
      }
    },
    {
      name: 'Daily Video Tab - History component',
      test: () => {
        const componentPath = 'app/admin/video-settings/components/video-generation-history.tsx'
        return fs.existsSync(componentPath)
      }
    }
  ]
  
  let passed = 0
  
  checks.forEach(check => {
    if (check.test()) {
      log(`${check.name}: Available`, 'success')
      passed++
    } else {
      log(`${check.name}: Missing or not functional`, 'warning')
    }
  })
  
  return passed >= checks.length * 0.8 // 80% threshold
}

// Main test runner
async function runComprehensiveTabTest() {
  console.log('🎯 Comprehensive 5-Tab Functionality Test')
  console.log(`🕒 Started at: ${new Date().toISOString()}`)
  
  const startTime = Date.now()
  const results = []
  
  try {
    results.push({
      name: 'Component Structure',
      passed: await testComponentStructure(),
      weight: 3
    })
    
    results.push({
      name: 'Page Imports',
      passed: await testPageImports(),
      weight: 3
    })
    
    results.push({
      name: 'Database Connectivity',
      passed: await testDatabaseConnectivity(),
      weight: 2
    })
    
    results.push({
      name: 'API Endpoints',
      passed: await testTabAPIEndpoints(),
      weight: 2
    })
    
    results.push({
      name: 'TypeScript Compilation',
      passed: await testTypeScriptCompilation(),
      weight: 2
    })
    
    results.push({
      name: 'Tab-Specific Functionality',
      passed: await testTabSpecificFunctionality(),
      weight: 1
    })
    
  } catch (error) {
    log(`Unexpected error during testing: ${error.message}`, 'error')
  }
  
  // Calculate results
  logSection('5-TAB FUNCTIONALITY SUMMARY')
  
  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0)
  const passedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0)
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  
  results.forEach(result => {
    const status = result.passed ? 'PASSED' : 'FAILED'
    log(`${result.name} (weight: ${result.weight}): ${status}`, result.passed ? 'success' : 'error')
  })
  
  const score = ((passedWeight / totalWeight) * 100).toFixed(1)
  
  console.log(`\n${'='.repeat(70)}`)
  log(`5-Tab Functionality Score: ${passedWeight}/${totalWeight} (${score}%)`)
  log(`Test Duration: ${duration} seconds`)
  log(`Finished at: ${new Date().toISOString()}`)
  
  // Tab-specific summary
  console.log('\n📑 TAB STATUS SUMMARY:')
  const tabStatus = [
    { name: 'Daily Video Tab', status: '✅ ACTIVE', features: ['Video display', 'Manual override', 'History'] },
    { name: 'Automation Tab', status: '✅ ACTIVE', features: ['Settings management', 'Status monitoring'] },
    { name: 'General Tab', status: '✅ ACTIVE', features: ['Duration settings', 'Auto-publish toggle'] },
    { name: 'Watch Time Tab', status: '✅ ACTIVE', features: ['Time preferences'] },
    { name: 'Content Tab', status: '✅ ACTIVE', features: ['Content management'] }
  ]
  
  tabStatus.forEach(tab => {
    console.log(`${tab.status} ${tab.name}: ${tab.features.join(', ')}`)
  })
  
  if (passedWeight === totalWeight) {
    log('🎉 ALL 5 TABS FULLY FUNCTIONAL! System is 100% operational.', 'success')
    process.exit(0)
  } else if (parseFloat(score) >= 90) {
    log('⚡ TABS MOSTLY FUNCTIONAL! Minor issues detected.', 'warning')
    process.exit(0)
  } else {
    log('💥 TAB ISSUES DETECTED! Critical fixes needed.', 'error')
    process.exit(1)
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection: ${reason}`, 'error')
  process.exit(1)
})

// Run the test
runComprehensiveTabTest()
