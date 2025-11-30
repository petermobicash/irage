/**
 * XHR PATCH 400 Error Diagnostic Script
 * 
 * This script helps diagnose and test the XHR PATCH 400 error:
 * PATCH https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?user_id=eq.a16c2293-fbb0-48ac-9edb-796185e648a2
 * 
 * Usage: 
 * 1. Open browser console on the website
 * 2. Paste and run this script
 * 3. Follow the diagnostic output and test results
 */

console.log('🔍 XHR PATCH 400 Error Diagnostic Tool');
console.log('======================================');
console.log('');

// Configuration
const USER_ID = 'a16c2293-fbb0-48ac-9edb-796185e648a2';
const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdXp2c2R3emZjb3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTUzNTIsImV4cCI6MjA0MDY3MTM1Mn0.Yj2nJQkP4c1lQOQ8eM5wL0hX5uK4pV8yR2mP3mK0sI';

// Test data for PATCH request
const testPatchData = {
  name: 'Test User',
  full_name: 'Test User',
  department: 'Test Department',
  position: 'Test Position',
  bio: 'Test bio for diagnostic purposes',
  phone: '+250123456789',
  location: 'Test Location',
  timezone: 'UTC',
  language_preference: 'en',
  profile_completed: true,
  onboarding_completed: true,
  notification_preferences: {
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    security_alerts: true
  }
};

// Utility functions
function logResult(test, result, error = null) {
  const icon = error ? '❌' : '✅';
  console.log(`${icon} ${test}:`, error ? error : result);
}

async function makeRequest(method, url, data = null, headers = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...headers
    }
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      rawText: responseText
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      rawText: '',
      error: error.message
    };
  }
}

// Diagnostic Tests
async function runDiagnostics() {
  console.log('🚀 Starting XHR PATCH 400 Error Diagnostics');
  console.log('');

  // Test 1: Check if user profile exists (GET)
  console.log('📋 Test 1: Check if target user profile exists');
  const getUrl = `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${USER_ID}&select=*`;
  const getResult = await makeRequest('GET', getUrl);
  
  if (getResult.ok) {
    const profiles = Array.isArray(getResult.data) ? getResult.data : [getResult.data];
    if (profiles.length > 0) {
      logResult('GET user profile', `Found ${profiles.length} profile(s)`, null);
      console.log('   Profile data:', JSON.stringify(profiles[0], null, 2));
    } else {
      logResult('GET user profile', 'Profile not found - this may cause PATCH failures', null);
    }
  } else {
    logResult('GET user profile', `HTTP ${getResult.status}: ${getResult.statusText}`, getResult.error || getResult.data);
  }
  console.log('');

  // Test 2: Test PATCH request
  console.log('🔄 Test 2: Test PATCH request with minimal data');
  const minimalPatchData = {
    name: 'Diagnostic Test',
    profile_completed: true
  };
  
  const patchUrl = `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${USER_ID}`;
  const patchResult = await makeRequest('PATCH', patchUrl, minimalPatchData);
  
  if (patchResult.ok) {
    logResult('PATCH minimal data', 'Request successful', null);
    console.log('   Response:', JSON.stringify(patchResult.data, null, 2));
  } else {
    logResult('PATCH minimal data', `HTTP ${patchResult.status}: ${patchResult.statusText}`, patchResult.error || patchResult.data);
    console.log('   Request headers:', patchResult.headers);
  }
  console.log('');

  // Test 3: Test PATCH request with full data
  console.log('🔄 Test 3: Test PATCH request with full test data');
  const patchFullResult = await makeRequest('PATCH', patchUrl, testPatchData);
  
  if (patchFullResult.ok) {
    logResult('PATCH full data', 'Request successful', null);
    console.log('   Response:', JSON.stringify(patchFullResult.data, null, 2));
  } else {
    logResult('PATCH full data', `HTTP ${patchFullResult.status}: ${patchFullResult.statusText}`, patchFullResult.error || patchFullResult.data);
    console.log('   Request body sent:', JSON.stringify(testPatchData, null, 2));
  }
  console.log('');

  // Test 4: Test individual field updates
  console.log('🔍 Test 4: Test individual field updates');
  const fields = ['name', 'full_name', 'department', 'bio', 'phone', 'location'];
  
  for (const field of fields) {
    const testData = { [field]: `Test ${field} value` };
    const result = await makeRequest('PATCH', patchUrl, testData);
    
    if (result.ok) {
      logResult(`PATCH ${field}`, 'Field updated successfully', null);
    } else {
      logResult(`PATCH ${field}`, `HTTP ${result.status}`, result.error || result.data);
    }
  }
  console.log('');

  // Test 5: Check RLS policies by testing authenticated requests
  console.log('🔐 Test 5: Check authentication and RLS policies');
  
  // First try without authentication
  const noAuthResult = await makeRequest('GET', getUrl, null, { 
    'apikey': SUPABASE_ANON_KEY
    // No Authorization header
  });
  
  if (noAuthResult.ok) {
    logResult('No auth GET', 'Public access allowed', null);
  } else {
    logResult('No auth GET', `HTTP ${noAuthResult.status}`, noAuthResult.error || noAuthResult.data);
  }

  // Test with authentication (assuming user is logged in)
  if (window.supabase) {
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      if (user) {
        console.log(`👤 Authenticated as: ${user.email} (${user.id})`);
        
        // Get the user's access token
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session?.access_token) {
          const authGetResult = await makeRequest('GET', getUrl, null, {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`
          });
          
          if (authGetResult.ok) {
            logResult('Authenticated GET', 'Access granted', null);
          } else {
            logResult('Authenticated GET', `HTTP ${authGetResult.status}`, authGetResult.error || authGetResult.data);
          }
        }
      } else {
        console.log('👤 Not authenticated - testing anonymous access');
      }
    } catch (error) {
      logResult('Auth check', 'Error checking authentication', error.message);
    }
  } else {
    console.log('⚠️  Supabase client not found in window object');
  }
  console.log('');

  // Test 6: Test the exact scenario from UserOnboarding.tsx
  console.log('🎯 Test 6: Test UserOnboarding.tsx scenario');
  const onboardingData = {
    name: 'Onboarding Test User',
    full_name: 'Onboarding Test User',
    department: 'Onboarding Department',
    position: 'Onboarding Position',
    bio: 'Onboarding bio test',
    phone: '+250987654321',
    location: 'Kigali, Rwanda',
    timezone: 'Africa/Kigali',
    language_preference: 'en',
    profile_completed: true,
    onboarding_completed: true
  };
  
  const onboardingResult = await makeRequest('PATCH', patchUrl, onboardingData);
  
  if (onboardingResult.ok) {
    logResult('UserOnboarding PATCH', 'Onboarding scenario works', null);
    console.log('   Response:', JSON.stringify(onboardingResult.data, null, 2));
  } else {
    logResult('UserOnboarding PATCH', `HTTP ${onboardingResult.status}`, onboardingResult.error || onboardingResult.data);
    console.log('   This is likely the cause of the 400 error in your application');
  }
  console.log('');

  // Summary and recommendations
  console.log('📊 Diagnostic Summary');
  console.log('=====================');
  
  const results = [
    { name: 'Profile existence check', success: getResult.ok },
    { name: 'Minimal PATCH', success: patchResult.ok },
    { name: 'Full PATCH', success: patchFullResult.ok },
    { name: 'Onboarding PATCH', success: onboardingResult.ok }
  ];
  
  const successCount = results.filter(r => r.success).length;
  
  console.log(`✅ Successful tests: ${successCount}/${results.length}`);
  console.log(`❌ Failed tests: ${results.length - successCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('');
    console.log('🎉 All tests passed! XHR PATCH should work correctly.');
    console.log('💡 The 400 error might have been intermittent or already fixed.');
  } else {
    console.log('');
    console.log('🚨 Issues detected. Recommendations:');
    console.log('');
    
    if (!getResult.ok) {
      console.log('1. Profile Missing: Create the user profile first');
      console.log('   Solution: Run the SQL fix script (xhr_patch_400_error_fix.sql)');
    }
    
    if (!patchResult.ok) {
      console.log('2. Schema Mismatch: Missing columns in user_profiles table');
      console.log('   Solution: Add missing columns using the SQL fix script');
    }
    
    if (!patchFullResult.ok) {
      console.log('3. Data Type Issues: Invalid data in PATCH request');
      console.log('   Solution: Check data types in frontend code');
    }
    
    if (!onboardingResult.ok) {
      console.log('4. UserOnboarding Issues: Frontend code needs updates');
      console.log('   Solution: Update UserOnboarding.tsx with proper error handling');
    }
  }
  
  console.log('');
  console.log('📖 For detailed solutions, see: XHR_PATCH_400_ERROR_SOLUTION.md');
  console.log('🔧 For database fixes, run: xhr_patch_400_error_fix.sql');
}

// Export functions for manual testing
window.XHRPatchDiagnostics = {
  makeRequest,
  testPatchData,
  USER_ID,
  runDiagnostics
};

// Auto-run diagnostics
runDiagnostics().catch(error => {
  console.error('Diagnostic error:', error);
});