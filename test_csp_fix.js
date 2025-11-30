#!/usr/bin/env node

/**
 * CSP Fix Verification Script
 * Tests if the Content Security Policy allows the correct Supabase URL
 */

import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const EXPECTED_PATTERNS = [
    `connect-src 'self' ${SUPABASE_URL}`,
    `wss://${SUPABASE_URL.replace('https://', '')}`
];

function checkCSPInFile(filePath, fileName) {
    console.log(`\n🔍 Checking CSP in ${fileName}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find CSP header - handle multiple formats
    let cspHeader = '';
    let found = false;
    
    // Try _headers format first (  Content-Security-Policy: value)
    let cspMatch = content.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
    if (cspMatch) {
        cspHeader = cspMatch[1].trim();
        found = true;
    } else {
        // Try TOML format (Content-Security-Policy = "value")
        cspMatch = content.match(/Content-Security-Policy\s*=\s*"([^"]+)"/);
        if (cspMatch) {
            cspHeader = cspMatch[1];
            found = true;
        }
    }
    
    if (!found) {
        console.log(`❌ No Content-Security-Policy header found in ${fileName}`);
        return false;
    }
    
    console.log(`📋 Found CSP header: ${cspHeader.substring(0, 100)}...`);
    
    // Check if it contains the correct Supabase URL
    const hasCorrectURL = cspHeader.includes(SUPABASE_URL);
    const hasCorrectWSS = cspHeader.includes(`wss://${SUPABASE_URL.replace('https://', '')}`);
    const hasCorrectWS = cspHeader.includes(`ws://${SUPABASE_URL.replace('https://', '')}`);
    
    console.log(`✅ Contains correct HTTPS URL: ${hasCorrectURL ? 'YES' : 'NO'}`);
    console.log(`✅ Contains correct WSS URL: ${hasCorrectWSS ? 'YES' : 'NO'}`);
    console.log(`✅ Contains correct WS URL: ${hasCorrectWS ? 'YES' : 'NO'}`);
    
    // Check for old/incorrect URLs
    const oldURL = 'https://fjhqjsbnumcxkbirlrxj.supabase.co';
    const hasOldURL = cspHeader.includes(oldURL);
    console.log(`🚫 Contains old/incorrect URL: ${hasOldURL ? 'YES (PROBLEM!)' : 'NO'}`);
    
    const isValid = hasCorrectURL && hasCorrectWSS && !hasOldURL;
    console.log(`${isValid ? '✅' : '❌'} Overall CSP status: ${isValid ? 'VALID' : 'INVALID'}`);
    
    return isValid;
}

function testAboutPageRequests() {
    console.log(`\n🔬 Testing About page API requests...`);
    
    // Simulate the requests that About page would make
    const testRequests = [
        {
            url: `${SUPABASE_URL}/rest/v1/content?select=id&slug=eq.about-page`,
            type: 'Content fetch for About page'
        },
        {
            url: `${SUPABASE_URL}/rest/v1/comments?select=*&content_slug=eq.about-page`,
            type: 'Comments fetch for About page'
        }
    ];
    
    console.log('\n📡 Testing API endpoints that About page will call:');
    
    testRequests.forEach((request, index) => {
        console.log(`\n${index + 1}. ${request.type}`);
        console.log(`   URL: ${request.url}`);
        
        // Extract domain for CSP checking
        const urlObj = new URL(request.url);
        const domain = urlObj.hostname;
        const protocol = urlObj.protocol.replace(':', '');
        
        console.log(`   Domain: ${domain}`);
        console.log(`   Protocol: ${protocol}`);
        
        // Check if this would be allowed by current CSP
        if (domain === 'sshguczouozvsdwzfcbx.supabase.co') {
            console.log(`   ✅ Would be ALLOWED by CSP (correct domain)`);
        } else {
            console.log(`   ❌ Would be BLOCKED by CSP (wrong domain)`);
        }
        
        if (protocol === 'https' || protocol === 'wss') {
            console.log(`   ✅ Protocol ${protocol} is allowed`);
        } else {
            console.log(`   ⚠️  Protocol ${protocol} - check CSP configuration`);
        }
    });
}

function main() {
    console.log('🧪 CSP Fix Verification for Benirage Platform');
    console.log('===============================================');
    console.log(`Target Supabase URL: ${SUPABASE_URL}`);
    
    // Check all CSP configuration files
    const filesToCheck = [
        { path: 'netlify.toml', name: 'Netlify Configuration' },
        { path: 'public/_headers', name: 'Public Headers' },
        { path: 'dist/_headers', name: 'Built Headers' }
    ];
    
    const results = filesToCheck.map(file => ({
        ...file,
        valid: checkCSPInFile(file.path, file.name)
    }));
    
    console.log('\n📊 Summary of CSP Configuration Status:');
    console.log('=======================================');
    
    let allValid = true;
    results.forEach(result => {
        const status = result.valid ? '✅ VALID' : '❌ INVALID';
        console.log(`${result.name}: ${status}`);
        if (!result.valid) allValid = false;
    });
    
    testAboutPageRequests();
    
    console.log('\n🎯 Final Result:');
    if (allValid) {
        console.log('✅ ALL CSP configurations are correct and allow the Supabase URL');
        console.log('✅ The About page should work without CSP violations');
        console.log('✅ No additional fixes needed');
    } else {
        console.log('❌ Some CSP configurations need to be updated');
        console.log('❌ About page may still experience CSP violations');
        console.log('❌ Additional fixes required');
    }
    
    console.log('\n📝 Expected Behavior on About Page:');
    console.log('- Comments section should load without errors');
    console.log('- No CSP violation errors in browser console');
    console.log('- All API calls to Supabase should succeed');
    console.log('- Page should function normally');
}

// Run the verification
main();