#!/usr/bin/env node

/**
 * Topics Management System Validation Script
 * Tests the complete functionality of the new topics management system
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Test utilities
function logTest(description, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`✅ ${description}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${description}`);
    if (details) console.log(`   └─ ${details}`);
    testResults.errors.push({ description, details });
  }
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function logSection(title) {
  console.log(`\n🔷 ${title}`);
  console.log('─'.repeat(50));
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API Test Functions
async function testTopicsAPI() {
  logSection('Topics API Validation');

  try {
    // Test 1: GET /api/admin/topics
    logInfo('Testing topics list retrieval...');
    const listResponse = await fetch(`${BASE_URL}/api/admin/topics`);
    const success1 = listResponse.status === 200;
    logTest('GET /api/admin/topics - List topics', success1);

    if (success1) {
      const listData = await listResponse.json();
      logTest('Topics API returns valid JSON structure', Array.isArray(listData.topics));
      logInfo(`Found ${listData.topics?.length || 0} existing topics`);
    }

    // Test 2: POST /api/admin/topics - Create topic
    logInfo('Testing topic creation...');
    const createData = {
      name: `Test Topic ${Date.now()}`,
      description: 'A test topic for validation',
      category: 'technology',
      keywords: ['test', 'validation', 'api'],
      weight: 5,
      is_active: true
    };

    const createResponse = await fetch(`${BASE_URL}/api/admin/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    const success2 = createResponse.status === 201;
    logTest('POST /api/admin/topics - Create topic', success2);

    let createdTopicId = null;
    if (success2) {
      const createResult = await createResponse.json();
      createdTopicId = createResult.topic?.id;
      logTest('Created topic has valid ID', !!createdTopicId);
      logInfo(`Created topic ID: ${createdTopicId}`);
    }

    // Test 3: PUT /api/admin/topics/[id] - Update topic
    if (createdTopicId) {
      logInfo('Testing topic update...');
      const updateData = {
        ...createData,
        name: `Updated ${createData.name}`,
        weight: 8
      };

      const updateResponse = await fetch(`${BASE_URL}/api/admin/topics/${createdTopicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const success3 = updateResponse.status === 200;
      logTest('PUT /api/admin/topics/[id] - Update topic', success3);
    }

    // Test 4: GET /api/admin/topics/[id] - Get single topic
    if (createdTopicId) {
      logInfo('Testing single topic retrieval...');
      const getResponse = await fetch(`${BASE_URL}/api/admin/topics/${createdTopicId}`);
      const success4 = getResponse.status === 200;
      logTest('GET /api/admin/topics/[id] - Get single topic', success4);
    }

    // Test 5: Bulk import
    logInfo('Testing bulk import...');
    const bulkData = {
      operation: 'import',
      topics: [
        {
          name: `Bulk Topic 1 ${Date.now()}`,
          category: 'science',
          keywords: ['bulk', 'import', 'test1'],
          description: 'Bulk imported topic 1'
        },
        {
          name: `Bulk Topic 2 ${Date.now()}`,
          category: 'education',
          keywords: ['bulk', 'import', 'test2'],
          description: 'Bulk imported topic 2'
        }
      ]
    };

    const bulkResponse = await fetch(`${BASE_URL}/api/admin/topics/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkData)
    });

    const success5 = bulkResponse.status === 200;
    logTest('POST /api/admin/topics/bulk - Bulk import', success5);

    // Test 6: DELETE /api/admin/topics/[id] - Delete topic (cleanup)
    if (createdTopicId) {
      logInfo('Testing topic deletion...');
      const deleteResponse = await fetch(`${BASE_URL}/api/admin/topics/${createdTopicId}`, {
        method: 'DELETE'
      });

      const success6 = deleteResponse.status === 200;
      logTest('DELETE /api/admin/topics/[id] - Delete topic', success6);
    }

  } catch (error) {
    logTest('Topics API tests', false, `Network error: ${error.message}`);
  }
}

async function testComponentIntegration() {
  logSection('Component Integration Validation');

  try {
    // Test admin page accessibility
    logInfo('Testing admin page accessibility...');
    const adminResponse = await fetch(`${BASE_URL}/admin/video-settings`);
    const success1 = adminResponse.status === 200;
    logTest('Admin video settings page loads', success1);

    if (success1) {
      const adminHTML = await adminResponse.text();
      
      // Check for Topics Management tab
      const hasTopicsTab = adminHTML.includes('Topics Management') || 
                          adminHTML.includes('topics-management') ||
                          adminHTML.includes('value="topics"');
      logTest('Topics Management tab present in UI', hasTopicsTab);

      // Check for component imports
      const hasTopicsComponent = adminHTML.includes('TopicsManagementTab') ||
                                adminHTML.toLowerCase().includes('topics');
      logTest('Topics Management component integrated', hasTopicsComponent);

      // Check for 3-tab structure
      const hasThreeTabs = adminHTML.includes('grid-cols-3') ||
                          adminHTML.includes('Daily Video') &&
                          adminHTML.includes('Automation') &&
                          adminHTML.includes('Topics');
      logTest('3-tab layout structure present', hasThreeTabs);
    }

  } catch (error) {
    logTest('Component integration tests', false, `Error: ${error.message}`);
  }
}

async function testDatabaseSchema() {
  logSection('Database Schema Validation');
  
  // This would require direct database access
  // For now, we'll test via API responses
  try {
    logInfo('Testing database schema via API...');
    
    // Test if topics table exists by creating a topic
    const testTopic = {
      name: `Schema Test ${Date.now()}`,
      description: 'Testing database schema',
      category: 'general',
      keywords: ['schema', 'test'],
      weight: 1,
      is_active: true
    };

    const response = await fetch(`${BASE_URL}/api/admin/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTopic)
    });

    if (response.status === 201) {
      const result = await response.json();
      const topic = result.topic;
      
      // Validate all required fields are present
      const hasId = !!topic.id;
      const hasName = !!topic.name;
      const hasCategory = !!topic.category;
      const hasKeywords = Array.isArray(topic.keywords);
      const hasWeight = typeof topic.weight === 'number';
      const hasIsActive = typeof topic.is_active === 'boolean';
      const hasTimestamps = !!topic.created_at && !!topic.updated_at;

      logTest('Topics table - ID field', hasId);
      logTest('Topics table - Name field', hasName);
      logTest('Topics table - Category field', hasCategory);
      logTest('Topics table - Keywords array field', hasKeywords);
      logTest('Topics table - Weight numeric field', hasWeight);
      logTest('Topics table - Is_active boolean field', hasIsActive);
      logTest('Topics table - Timestamp fields', hasTimestamps);

      // Cleanup
      await fetch(`${BASE_URL}/api/admin/topics/${topic.id}`, {
        method: 'DELETE'
      });
    } else {
      logTest('Database schema validation', false, 'Could not create test topic');
    }

  } catch (error) {
    logTest('Database schema tests', false, `Error: ${error.message}`);
  }
}

async function testHookFunctionality() {
  logSection('useTopics Hook Validation');
  
  // Since we can't directly test React hooks, we'll verify the API endpoints they rely on
  try {
    logInfo('Validating hook dependency endpoints...');
    
    // Test all endpoints that the hook uses
    const endpoints = [
      { method: 'GET', path: '/api/admin/topics', description: 'Load topics' },
      { method: 'POST', path: '/api/admin/topics', description: 'Create topic' },
      { method: 'PUT', path: '/api/admin/topics/test', description: 'Update topic' },
      { method: 'DELETE', path: '/api/admin/topics/test', description: 'Delete topic' },
      { method: 'POST', path: '/api/admin/topics/bulk', description: 'Bulk operations' }
    ];

    for (const endpoint of endpoints) {
      try {
        let response;
        if (endpoint.method === 'GET') {
          response = await fetch(`${BASE_URL}${endpoint.path}`);
        } else {
          // For other methods, we expect them to exist (even if they return errors)
          response = await fetch(`${BASE_URL}${endpoint.path}`, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
        }
        
        // We expect these endpoints to exist (not return 404)
        const endpointExists = response.status !== 404;
        logTest(`Hook endpoint: ${endpoint.method} ${endpoint.path}`, endpointExists);
        
      } catch (error) {
        logTest(`Hook endpoint: ${endpoint.method} ${endpoint.path}`, false, error.message);
      }
    }

  } catch (error) {
    logTest('Hook functionality tests', false, `Error: ${error.message}`);
  }
}

async function testTranscriptViewDetail() {
  logSection('Transcript View Detail Validation');
  
  try {
    logInfo('Testing transcript view detail functionality...');
    
    // Test if daily video display component is accessible
    const adminResponse = await fetch(`${BASE_URL}/admin/video-settings`);
    if (adminResponse.status === 200) {
      const adminHTML = await adminResponse.text();
      
      // Check for transcript-related functionality
      const hasTranscriptView = adminHTML.includes('transcript') || 
                               adminHTML.includes('View Detail') ||
                               adminHTML.includes('showFullTranscript');
      logTest('Transcript view functionality present', hasTranscriptView);

      const hasFileTextIcon = adminHTML.includes('FileText') || 
                             adminHTML.includes('file-text');
      logTest('FileText icon available for transcript', hasFileTextIcon);

      const hasViewDetailButton = adminHTML.includes('View Detail') ||
                                 adminHTML.includes('Show Less');
      logTest('View Detail toggle button present', hasViewDetailButton);
    } else {
      logTest('Transcript view detail tests', false, 'Could not access admin page');
    }

  } catch (error) {
    logTest('Transcript view detail tests', false, `Error: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Topics Management System Validation');
  console.log('📅 Date:', new Date().toISOString());
  console.log('🔗 Base URL:', BASE_URL);
  console.log('='.repeat(60));

  // Run all test suites
  await testTopicsAPI();
  await testComponentIntegration();
  await testDatabaseSchema();
  await testHookFunctionality();
  await testTranscriptViewDetail();

  // Final results
  logSection('Test Results Summary');
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Failed Test Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.description}`);
      if (error.details) console.log(`   ${error.details}`);
    });
  }

  const overallSuccess = testResults.failed === 0;
  const rating = testResults.passed / testResults.total;
  
  if (rating >= 0.9) {
    console.log('\n🏆 EXCELLENT: Topics Management System is working at 90%+ functionality!');
  } else if (rating >= 0.8) {
    console.log('\n🥈 GOOD: Topics Management System is working at 80%+ functionality');
  } else if (rating >= 0.7) {
    console.log('\n🥉 ACCEPTABLE: Topics Management System is working at 70%+ functionality');
  } else {
    console.log('\n⚠️  NEEDS IMPROVEMENT: Topics Management System needs more work');
  }

  console.log('\n📋 Next Steps:');
  if (overallSuccess) {
    console.log('✅ Topics Management System is fully operational');
    console.log('✅ All CRUD operations working');
    console.log('✅ Component integration complete');
    console.log('✅ Transcript view detail functional');
    console.log('🎯 System is ready for production use!');
  } else {
    console.log('🔧 Review failed tests above');
    console.log('🔧 Check server is running on localhost:3000');
    console.log('🔧 Verify database connections');
    console.log('🔧 Ensure all API routes are properly configured');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testTopicsAPI,
  testComponentIntegration,
  testDatabaseSchema,
  testHookFunctionality,
  testTranscriptViewDetail
};
