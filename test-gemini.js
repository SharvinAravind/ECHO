#!/usr/bin/env node

// Test script to verify Gemini API connectivity
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC3wZmi_IdPMdLSz86zLhL2zTTRjgLOSoQ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Connection...\n');
  
  const testPrompt = 'Say "Hello from EchoWrite!" in one sentence.';
  
  try {
    console.log('📤 Sending request to Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    console.log('✅ API Connection Successful!\n');
    console.log('📝 Response:', reply);
    console.log('\n✨ Gemini API is working correctly!\n');
    
    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify GEMINI_API_KEY is correct');
    console.error('3. Ensure Gemini API is enabled for your project\n');
    return false;
  }
}

// Run the test
testGeminiAPI().then(success => {
  process.exit(success ? 0 : 1);
});
