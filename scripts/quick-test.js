#!/usr/bin/env node

/**
 * Quick test script for video evaluation with real Supabase URLs
 * Tests the actual video evaluation flow that users experience
 */

require('dotenv').config();

// Import the evaluation functions
const { evaluateSubmissionForPublish } = require('../lib/gemini-video-evaluation');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function quickTest() {
  log('🧪 QUICK VIDEO EVALUATION TEST', 'cyan');
  log('='.repeat(50), 'cyan');
  
  // Test case with video that should be Vietnamese (low score)
  const vietnameseTest = {
    videoUrl: "http://127.0.0.1:54321/storage/v1/object/public/videos/current-user/test-vietnamese.mp4",
    caption: "Xin chào các bạn, hôm nay tôi sẽ nói về lịch sử nước Úc",
    transcript: "Australia today is one of the wealthiest and most highly developed nations on the planet",
    challengeContext: "Daily English Challenge - Original Video: \"The History of Australia\" | Topic: History"
  };
  
  // Test case with English content (should get higher score)
  const englishTest = {
    videoUrl: "http://127.0.0.1:54321/storage/v1/object/public/videos/current-user/test-english.mp4", 
    caption: "Hello everyone! Today I'm going to talk about Australian history. This is very interesting.",
    transcript: "Australia today is one of the wealthiest and most highly developed nations on the planet",
    challengeContext: "Daily English Challenge - Original Video: \"The History of Australia\" | Topic: History"
  };
  
  console.log('');
  log('Test 1: Vietnamese Content (should get low score 0-15)', 'yellow');
  log('-'.repeat(50), 'yellow');
  
  try {
    const startTime = Date.now();
    const result1 = await evaluateSubmissionForPublish(
      vietnameseTest.videoUrl,
      vietnameseTest.caption,
      vietnameseTest.transcript,
      vietnameseTest.challengeContext
    );
    const endTime = Date.now();
    
    log(`✅ Evaluation completed in ${endTime - startTime}ms`, 'green');
    log(`📊 Overall Score: ${result1.score}`, result1.score <= 15 ? 'green' : 'red');
    log(`🗣️ Pronunciation: ${result1.pronunciation}`, 'blue');
    log(`📚 Grammar: ${result1.grammar}`, 'blue');
    log(`🎯 Fluency: ${result1.fluency}`, 'blue');
    log(`📝 Vocabulary: ${result1.vocabulary}`, 'blue');
    log(`💬 Feedback: "${result1.feedback.substring(0, 100)}..."`, 'cyan');
    
    if (result1.score <= 15) {
      log('✅ CORRECT: Vietnamese content properly penalized', 'green');
    } else {
      log('❌ ERROR: Vietnamese content should have score ≤ 15', 'red');
    }
    
  } catch (error) {
    log(`❌ Test 1 failed: ${error.message}`, 'red');
  }
  
  console.log('');
  log('Test 2: English Content (should get moderate to high score 50-90)', 'yellow');
  log('-'.repeat(50), 'yellow');
  
  try {
    const startTime = Date.now();
    const result2 = await evaluateSubmissionForPublish(
      englishTest.videoUrl,
      englishTest.caption,
      englishTest.transcript,
      englishTest.challengeContext
    );
    const endTime = Date.now();
    
    log(`✅ Evaluation completed in ${endTime - startTime}ms`, 'green');
    log(`📊 Overall Score: ${result2.score}`, result2.score >= 50 ? 'green' : 'red');
    log(`🗣️ Pronunciation: ${result2.pronunciation}`, 'blue');
    log(`📚 Grammar: ${result2.grammar}`, 'blue');
    log(`🎯 Fluency: ${result2.fluency}`, 'blue');
    log(`📝 Vocabulary: ${result2.vocabulary}`, 'blue');
    log(`💬 Feedback: "${result2.feedback.substring(0, 100)}..."`, 'cyan');
    
    if (result2.score >= 50) {
      log('✅ CORRECT: English content properly evaluated', 'green');
    } else {
      log('❌ ERROR: English content should have score ≥ 50', 'red');
    }
    
  } catch (error) {
    log(`❌ Test 2 failed: ${error.message}`, 'red');
  }
  
  console.log('');
  log('🏁 QUICK TEST SUMMARY', 'cyan');
  log('='.repeat(50), 'cyan');
  log('✅ Test completed! Check the results above.', 'green');
  log('If Vietnamese content got >15 points or English content got <50 points, there may be an issue.', 'yellow');
}

async function testCurrentUserVideo() {
  log('🎥 TESTING CURRENT USER VIDEO', 'cyan');
  log('='.repeat(50), 'cyan');
  
  // This simulates the exact same call that the daily challenge makes
  const testData = {
    videoUrl: "http://127.0.0.1:54321/storage/v1/object/public/videos/current-user/1b532b04-3826-4f2f-9300-7ba0908ea75f.mp4",
    caption: "<p>Create a blog post or article based on the video content. Use the rich text editor to format your content.</p>",
    transcript: "Australia today is one of the wealthiest and most highly developed nations on the planet, boasting enviably high levels of education,",
    challengeContext: "Daily English Challenge - Original Video: \"The Entire History of Australia\" | Topic: History | User is responding to and creating content based on this original video."
  };
  
  log('Testing with actual user video...', 'blue');
  console.log('Video URL:', testData.videoUrl);
  console.log('Caption preview:', testData.caption.substring(0, 50) + '...');
  console.log('Transcript preview:', testData.transcript.substring(0, 50) + '...');
  
  try {
    const startTime = Date.now();
    
    const evaluation = await evaluateSubmissionForPublish(
      testData.videoUrl,
      testData.caption,
      testData.transcript,
      testData.challengeContext
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`✅ Evaluation completed in ${duration}ms`, 'green');
    
    // Display detailed results
    console.log('');
    log('📊 DETAILED EVALUATION RESULTS:', 'cyan');
    console.log('Overall Score:', evaluation.score);
    console.log('Pronunciation:', evaluation.pronunciation);
    console.log('Intonation:', evaluation.intonation);
    console.log('Stress:', evaluation.stress);
    console.log('Linking Sounds:', evaluation.linkingSounds);
    console.log('Grammar:', evaluation.grammar);
    console.log('Tenses:', evaluation.tenses);
    console.log('Vocabulary:', evaluation.vocabulary);
    console.log('Collocations:', evaluation.collocations);
    console.log('Fluency:', evaluation.fluency);
    console.log('Speaking Speed:', evaluation.speakingSpeed);
    console.log('Confidence:', evaluation.confidence);
    console.log('Coherence:', evaluation.coherence);
    console.log('Content:', evaluation.content);
    
    console.log('');
    log('💬 FEEDBACK:', 'cyan');
    console.log(evaluation.feedback);
    
    console.log('');
    log('💪 STRENGTHS:', 'green');
    evaluation.strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength}`);
    });
    
    console.log('');
    log('📈 AREAS TO IMPROVE:', 'yellow');
    evaluation.weaknesses.forEach((weakness, index) => {
      console.log(`${index + 1}. ${weakness}`);
    });
    
    // Validate the results
    console.log('');
    log('🔍 VALIDATION:', 'cyan');
    
    if (evaluation.score >= 0 && evaluation.score <= 100) {
      log('✅ Score is within valid range (0-100)', 'green');
    } else {
      log(`❌ Score ${evaluation.score} is outside valid range`, 'red');
    }
    
    if (evaluation.feedback && evaluation.feedback.length > 20) {
      log('✅ Feedback has adequate length', 'green');
    } else {
      log('❌ Feedback is too short or missing', 'red');
    }
    
    const requiredScores = ['pronunciation', 'grammar', 'fluency', 'vocabulary'];
    let allScoresValid = true;
    
    for (const scoreType of requiredScores) {
      const score = evaluation[scoreType];
      if (score >= 0 && score <= 100) {
        log(`✅ ${scoreType}: ${score} (valid)`, 'green');
      } else {
        log(`❌ ${scoreType}: ${score} (invalid)`, 'red');
        allScoresValid = false;
      }
    }
    
    if (allScoresValid) {
      log('✅ All core scores are valid', 'green');
    } else {
      log('❌ Some scores are invalid', 'red');
    }
    
    // Performance check
    if (duration < 10000) {
      log(`✅ Good response time: ${duration}ms`, 'green');
    } else if (duration < 20000) {
      log(`⚠️ Acceptable response time: ${duration}ms`, 'yellow');
    } else {
      log(`❌ Slow response time: ${duration}ms`, 'red');
    }
    
  } catch (error) {
    log(`❌ Evaluation failed: ${error.message}`, 'red');
    console.error('Full error:', error);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node quick-test.js [options]

Options:
  --current       Test with current user video (same as daily challenge)
  --quick         Run quick comparison test (Vietnamese vs English)
  --help, -h      Show this help message

Examples:
  node quick-test.js --current    # Test actual user video
  node quick-test.js --quick      # Quick Vietnamese vs English test
  node quick-test.js              # Run both tests
    `);
    process.exit(0);
  }
  
  async function main() {
    if (args.includes('--current')) {
      await testCurrentUserVideo();
    } else if (args.includes('--quick')) {
      await quickTest();
    } else {
      // Run both tests
      await testCurrentUserVideo();
      console.log('\n' + '='.repeat(70) + '\n');
      await quickTest();
    }
  }
  
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  quickTest,
  testCurrentUserVideo
};
