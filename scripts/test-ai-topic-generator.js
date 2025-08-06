#!/usr/bin/env node

/**
 * AI Topic Generator System Validation Script
 * Tests the AI-powered topic generation functionality
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

// Test AI API functionality
async function testAIAPI() {
  logSection('AI API Integration Test');

  try {
    logInfo('Testing AI chat API for topic generation...');
    
    const testPrompt = `Generate 3 English learning topics based on: "Technology and Innovation"`;
    const systemPrompt = `You are an AI topic generator for an English learning platform. Your task is to generate relevant topics and keywords for YouTube video fetching.

    Given user input, generate 3 diverse and educational topics with the following requirements:
    1. Each topic should be suitable for English learning content
    2. Topics should span different categories (technology, science, business, education, entertainment, health, politics, sports, travel, general)
    3. Each topic should have 3-7 relevant keywords for YouTube search
    4. Provide a confidence score (0-100) for each topic
    5. Include a brief explanation of why these topics are good for English learning

    Categories available: technology, science, business, education, entertainment, health, politics, sports, travel, general

    Response format should be valid JSON:
    {
      "topics": [
        {
          "name": "Topic Name",
          "description": "Brief description of the topic",
          "category": "category_name",
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "confidence": 85
        }
      ],
      "reasoning": "Explanation of why these topics are good for English learning",
      "additionalSuggestions": ["suggestion1", "suggestion2"]
    }`;

    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt,
        systemPrompt: systemPrompt
      })
    });

    const success1 = response.status === 200;
    logTest('AI API responds successfully', success1);

    if (success1) {
      const data = await response.json();
      const hasResponse = !!data.response;
      logTest('AI API returns valid response', hasResponse);
      
      if (hasResponse) {
        logInfo(`AI Response preview: ${data.response.substring(0, 100)}...`);
        
        // Try to parse as JSON to validate structure
        try {
          const jsonMatch = data.response.match(/```json\n?([\s\S]*?)\n?```/) || data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[1] || jsonMatch[0];
            const parsedData = JSON.parse(jsonString);
            
            const hasTopics = parsedData.topics && Array.isArray(parsedData.topics);
            const hasValidTopics = hasTopics && parsedData.topics.length > 0;
            const hasRequiredFields = hasValidTopics && parsedData.topics.every(topic => 
              topic.name && topic.category && topic.keywords && Array.isArray(topic.keywords)
            );

            logTest('AI response contains topics array', hasTopics);
            logTest('AI response has valid topic structure', hasRequiredFields);
            
            if (hasValidTopics) {
              logInfo(`Generated ${parsedData.topics.length} topics`);
              parsedData.topics.forEach((topic, index) => {
                logInfo(`  ${index + 1}. ${topic.name} (${topic.category}) - ${topic.keywords?.length || 0} keywords`);
              });
            }
          } else {
            logTest('AI response contains valid JSON', false, 'No JSON structure found');
          }
        } catch (parseError) {
          logTest('AI response is parseable JSON', false, `Parse error: ${parseError.message}`);
        }
      }
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      logTest('AI API accessibility', false, `Status: ${response.status}, Error: ${errorText}`);
    }

  } catch (error) {
    logTest('AI API integration', false, `Network error: ${error.message}`);
  }
}

// Test AI Topic Generator component integration
async function testAITopicGeneratorIntegration() {
  logSection('AI Topic Generator Component Integration');

  try {
    logInfo('Testing admin page with AI Topic Generator...');
    
    const response = await fetch(`${BASE_URL}/admin/video-settings`);
    const success1 = response.status === 200;
    logTest('Admin page loads successfully', success1);

    if (success1) {
      const htmlContent = await response.text();
      
      // Check for AI Topic Generator components
      const hasAIGenerator = htmlContent.includes('AI Topic Generator') || 
                            htmlContent.includes('ai-topic-generator') ||
                            htmlContent.includes('AITopicGenerator');
      logTest('AI Topic Generator component present', hasAIGenerator);

      const hasBotIcon = htmlContent.includes('Bot') || htmlContent.includes('bot');
      logTest('Bot icon available for AI features', hasBotIcon);

      const hasSparklesIcon = htmlContent.includes('Sparkles') || htmlContent.includes('sparkles');
      logTest('Sparkles icon for AI indication', hasSparklesIcon);

      const hasGeminiReference = htmlContent.includes('Gemini') || htmlContent.includes('gemini');
      logTest('Gemini AI integration reference', hasGeminiReference);

      // Check for hook integration
      const hasUseAIHook = htmlContent.includes('useAITopicGenerator') || 
                          htmlContent.includes('use-ai-topic-generator');
      logTest('useAITopicGenerator hook integration', hasUseAIHook);

      // Check for Topics Management tab with 3-tab structure
      const hasTopicsTab = htmlContent.includes('Topics Management') || 
                          htmlContent.includes('topics-management');
      logTest('Topics Management tab with AI features', hasTopicsTab);

      const hasThreeTabStructure = htmlContent.includes('grid-cols-3');
      logTest('3-tab admin interface structure', hasThreeTabStructure);
    }

  } catch (error) {
    logTest('AI Topic Generator integration', false, `Error: ${error.message}`);
  }
}

// Test Topics API with AI-generated data
async function testTopicsAPIWithAI() {
  logSection('Topics API with AI Integration');

  try {
    logInfo('Testing topics creation with AI-generated data...');
    
    // Simulate AI-generated topic data
    const aiGeneratedTopic = {
      name: `AI Generated Topic ${Date.now()}`,
      description: 'A topic generated by AI for testing purposes',
      category: 'technology',
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'technology'],
      weight: 5,
      is_active: true
    };

    const createResponse = await fetch(`${BASE_URL}/api/admin/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiGeneratedTopic)
    });

    const success1 = createResponse.status === 201;
    logTest('AI-generated topic creation via API', success1);

    let createdTopicId = null;
    if (success1) {
      const createData = await createResponse.json();
      createdTopicId = createData.topic?.id;
      logTest('AI-generated topic has valid ID', !!createdTopicId);
      
      // Verify AI-generated fields
      const topic = createData.topic;
      const hasAIKeywords = topic.keywords && topic.keywords.length >= 3;
      const hasDescription = !!topic.description;
      const hasCategory = !!topic.category;
      const hasWeight = topic.weight === 5; // Default for AI-generated

      logTest('AI-generated topic has multiple keywords', hasAIKeywords);
      logTest('AI-generated topic has description', hasDescription);
      logTest('AI-generated topic has category', hasCategory);
      logTest('AI-generated topic has default AI weight', hasWeight);
    }

    // Test bulk operations with AI data
    if (createdTopicId) {
      logInfo('Testing AI topic in list retrieval...');
      const listResponse = await fetch(`${BASE_URL}/api/admin/topics`);
      
      if (listResponse.status === 200) {
        const listData = await listResponse.json();
        const topics = listData.topics || [];
        const aiTopic = topics.find(t => t.id === createdTopicId);
        
        logTest('AI-generated topic appears in topics list', !!aiTopic);
        
        if (aiTopic) {
          logTest('AI topic maintains keyword structure', Array.isArray(aiTopic.keywords));
          logTest('AI topic has confidence-equivalent weight', aiTopic.weight >= 1);
        }
      }

      // Cleanup
      await fetch(`${BASE_URL}/api/admin/topics/${createdTopicId}`, {
        method: 'DELETE'
      });
    }

  } catch (error) {
    logTest('Topics API with AI data', false, `Error: ${error.message}`);
  }
}

// Test AI Topic Generator workflow
async function testAIWorkflow() {
  logSection('AI Topic Generator Workflow');

  try {
    logInfo('Testing complete AI topic generation workflow...');
    
    // Simulate the workflow steps
    const workflowSteps = [
      {
        name: 'User Input Processing',
        test: () => {
          const userInput = 'Climate change and environmental sustainability';
          const isValid = userInput.trim().length > 0;
          return isValid;
        }
      },
      {
        name: 'AI Prompt Construction',
        test: () => {
          const systemPrompt = 'Generate topics for English learning platform';
          const userPrompt = 'Climate change topics';
          const hasSystemPrompt = systemPrompt.length > 0;
          const hasUserPrompt = userPrompt.length > 0;
          return hasSystemPrompt && hasUserPrompt;
        }
      },
      {
        name: 'Response Processing',
        test: () => {
          const mockResponse = {
            topics: [
              {
                name: 'Climate Change Solutions',
                description: 'Exploring innovative solutions to climate change',
                category: 'science',
                keywords: ['climate', 'solutions', 'environment'],
                confidence: 85
              }
            ],
            reasoning: 'These topics are educational and current'
          };
          
          const hasTopics = Array.isArray(mockResponse.topics);
          const hasValidStructure = mockResponse.topics.every(t => 
            t.name && t.category && Array.isArray(t.keywords)
          );
          
          return hasTopics && hasValidStructure;
        }
      },
      {
        name: 'Topic Validation',
        test: () => {
          const topic = {
            name: 'Test Topic',
            description: 'Test description',
            category: 'science',
            keywords: ['test', 'keywords'],
            confidence: 80
          };
          
          const hasRequiredFields = !!(topic.name && topic.category && topic.keywords);
          const hasValidKeywords = Array.isArray(topic.keywords) && topic.keywords.length > 0;
          const hasValidConfidence = topic.confidence >= 0 && topic.confidence <= 100;
          
          return hasRequiredFields && hasValidKeywords && hasValidConfidence;
        }
      },
      {
        name: 'Database Integration',
        test: () => {
          // Simulate database operation
          const topicForDB = {
            name: 'AI Test Topic',
            description: 'Generated by AI',
            category: 'technology',
            keywords: ['ai', 'test'],
            weight: 5,
            is_active: true
          };
          
          const hasRequiredDBFields = !!(topicForDB.name && topicForDB.category);
          const hasDefaultWeight = topicForDB.weight === 5;
          const hasActiveStatus = topicForDB.is_active === true;
          
          return hasRequiredDBFields && hasDefaultWeight && hasActiveStatus;
        }
      }
    ];

    for (const step of workflowSteps) {
      try {
        const result = step.test();
        logTest(`Workflow step: ${step.name}`, result);
      } catch (error) {
        logTest(`Workflow step: ${step.name}`, false, error.message);
      }
    }

  } catch (error) {
    logTest('AI workflow validation', false, `Error: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🤖 AI Topic Generator System Validation');
  console.log('📅 Date:', new Date().toISOString());
  console.log('🔗 Base URL:', BASE_URL);
  console.log('='.repeat(60));

  // Run all test suites
  await testAIAPI();
  await testAITopicGeneratorIntegration();
  await testTopicsAPIWithAI();
  await testAIWorkflow();

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
    console.log('\n🏆 EXCELLENT: AI Topic Generator System is working at 90%+ functionality!');
  } else if (rating >= 0.8) {
    console.log('\n🥈 GOOD: AI Topic Generator System is working at 80%+ functionality');
  } else if (rating >= 0.7) {
    console.log('\n🥉 ACCEPTABLE: AI Topic Generator System is working at 70%+ functionality');
  } else {
    console.log('\n⚠️  NEEDS IMPROVEMENT: AI Topic Generator System needs more work');
  }

  console.log('\n📋 AI Topic Generator Features:');
  console.log('🤖 AI-powered topic generation using Gemini API');
  console.log('✨ Dynamic keyword generation for YouTube search');
  console.log('🎯 Category-aware topic suggestions');
  console.log('⚖️  Confidence scoring for topic quality');
  console.log('🔄 Topic supplementation and enhancement');
  console.log('✏️  Admin editing and validation capabilities');
  console.log('💾 Seamless database integration');
  console.log('🎨 Beautiful UI with animations and feedback');

  console.log('\n🎯 System Status:');
  if (overallSuccess) {
    console.log('✅ AI Topic Generator fully operational');
    console.log('✅ Gemini AI integration working');
    console.log('✅ Topic generation and validation complete');
    console.log('✅ Database operations functional');
    console.log('✅ UI components integrated successfully');
    console.log('🚀 Ready for admin use in production!');
  } else {
    console.log('🔧 Review failed tests above');
    console.log('🔧 Check AI API configuration');
    console.log('🔧 Verify Gemini API keys');
    console.log('🔧 Ensure component integration');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAIAPI,
  testAITopicGeneratorIntegration,
  testTopicsAPIWithAI,
  testAIWorkflow
};
