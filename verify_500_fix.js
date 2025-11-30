// ===============================================
// VERIFICATION SCRIPT FOR HTTP 500 FIX
// ===============================================
// This script tests the previously failing endpoint
// to confirm the fix is working

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace with your anon key

async function testUserProfilesEndpoint() {
    console.log('Testing user_profiles endpoint...');
    console.log('URL:', `${SUPABASE_URL}/rest/v1/user_profiles?select=*&order=created_at.desc`);
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS: Received user profiles data');
            console.log('Profile count:', data.length);
            console.log('First profile:', data[0] ? {
                id: data[0].id,
                username: data[0].username,
                role: data[0].role
            } : 'No profiles found');
        } else {
            const errorText = await response.text();
            console.log('❌ FAILED: Still getting error');
            console.log('Error response:', errorText);
        }
        
    } catch (error) {
        console.log('❌ NETWORK ERROR:', error.message);
    }
}

// Run the test
testUserProfilesEndpoint();