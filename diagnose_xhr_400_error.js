#!/usr/bin/env node

/**
 * XHR 400 Error Diagnostic Script
 * 
 * This script helps identify and fix the source of the HTTP 400 error:
 * GET /rest/v1/user_profiles?select=user_id&id=eq.new
 * 
 * The issue is that "new" is being treated as a literal string instead of a variable.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 XHR 400 Error Diagnostic Tool');
console.log('=================================');
console.log('');

const searchTerms = [
  'eq\\.[a-zA-Z_$][a-zA-Z0-9_$]*', // eq.*variable patterns
  'user_profiles.*[a-zA-Z_$][a-zA-Z0-9_$]*',
  String.raw`=.*["']?[a-zA-Z_$][a-zA-Z0-9_$]*["']?`, // variable assignments
  'user_id.*eq.*[a-zA-Z_$][a-zA-Z0-9_$]*',
  'id.*eq.*[a-zA-Z_$][a-zA-Z0-9_$]*',
  String.raw`=["']new["']` // specific hardcoded "new" values
];

const srcPath = path.join(__dirname, 'src');

if (!fs.existsSync(srcPath)) {
  console.log('❌ src/ directory not found. Running from project root is recommended.');
  process.exit(1);
}

console.log('🔎 Scanning for potential issues...\n');

let totalIssues = 0;
const foundIssues = [];

// Search for problematic patterns
searchTerms.forEach(term => {
  try {
    const results = searchInDirectory(srcPath, term);
    if (results.length > 0) {
      totalIssues += results.length;
      foundIssues.push({ pattern: term, files: results });
      console.log(`❌ Found ${results.length} matches for pattern: ${term}`);
      results.forEach(file => {
        console.log(`   📄 ${file}`);
      });
      console.log('');
    }
  } catch (error) {
    console.log(`⚠️  Error searching for ${term}: ${error.message}`);
  }
});

if (totalIssues === 0) {
  console.log('✅ No obvious issues found in source code.');
  console.log('');
  console.log('💡 The "new" might be coming from:');
  console.log('   1. Runtime variable that gets "new" value');
  console.log('   2. URL parameter not being replaced');
  console.log('   3. Form state with default "new" value');
  console.log('');
} else {
  console.log(`🚨 Found ${totalIssues} potential issues that need fixing.`);
  console.log('');
}

// Additional checks
console.log('🔧 Additional Checks:');
console.log('=====================');

checkCommonIssues();

console.log('');
console.log('🛠️  Quick Fix Commands:');
console.log('=======================');
console.log('');
console.log('1. Find all instances of problematic patterns:');
console.log('   grep -r "eq\.[a-zA-Z_$]" src/ --include="*.ts" --include="*.tsx"');
console.log('   grep -r "user_profiles.*[a-zA-Z_$]" src/ --include="*.ts" --include="*.tsx"');
console.log('');
console.log('2. Check for hardcoded "new" values:');
console.log('   grep -r \'="new"\' src/ --include="*.ts" --include="*.tsx"');
console.log('   grep -r "=\\"new\\"" src/ --include="*.ts" --include="*.tsx"');
console.log('');
console.log('3. Look for URL construction issues:');
console.log('   grep -r "\\$\\{.*user.*\\}" src/ --include="*.ts" --include="*.tsx"');
console.log('');

console.log('📋 Fix Summary:');
console.log('===============');
if (totalIssues > 0) {
  console.log('Issues found that need manual fixing:');
  foundIssues.forEach(issue => {
    console.log(`- Pattern: ${issue.pattern}`);
    console.log(`  Files: ${issue.files.join(', ')}`);
  });
} else {
  console.log('No obvious code issues found.');
  console.log('The problem might be runtime-related.');
}
console.log('');
console.log('📖 See XHR_400_NEW_VARIABLE_FIX.md for detailed fix instructions.');

/**
 * Search for a pattern in all TypeScript/JavaScript files
 */
function searchInDirectory(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...searchInDirectory(fullPath, pattern));
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const regex = new RegExp(pattern, 'g');
        if (regex.test(content)) {
          files.push(fullPath);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
  
  return files;
}

/**
 * Check for common issues that might cause the "new" problem
 */
function checkCommonIssues() {
  // Check for URL template literals
  const urlPatterns = [
    /[`'"].*user_profiles.*[`'"]/g,
    /[\$\{][^}]*user[^}]*}/g,
    /[\$\{][^}]*id[^}]*}/g
  ];
  
  console.log('');
  console.log('🔍 Checking for URL construction patterns...');
  
  try {
    const allTsFiles = getAllTypeScriptFiles(srcPath);
    let urlConstructionIssues = 0;
    
    allTsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      urlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            console.log(`   ⚠️  Found potential URL construction: ${match.trim()}`);
            console.log(`      File: ${file}`);
            urlConstructionIssues++;
          });
        }
      });
    });
    
    if (urlConstructionIssues === 0) {
      console.log('   ✅ No obvious URL construction issues found');
    }
  } catch (error) {
    console.log(`   ⚠️  Error checking URL patterns: ${error.message}`);
  }
  
  // Check for hardcoded "new" values
  console.log('');
  console.log('🔍 Checking for hardcoded "new" values...');
  
  try {
    const allTsFiles = getAllTypeScriptFiles(srcPath);
    let hardcodedNewIssues = 0;
    
    allTsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const newPatterns = [
        /=\s*['"]new['"]/g,
        /=\s*"new"\s*/g,
        /=\s*'new'\s*/g,
        /userId\s*=\s*['"]new['"]/g,
        /id\s*=\s*['"]new['"]/g
      ];
      
      newPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            console.log(`   ❌ Found hardcoded "new": ${match}`);
            console.log(`      File: ${file}`);
            hardcodedNewIssues++;
          });
        }
      });
    });
    
    if (hardcodedNewIssues === 0) {
      console.log('   ✅ No hardcoded "new" values found');
    }
  } catch (error) {
    console.log(`   ⚠️  Error checking for hardcoded "new": ${error.message}`);
  }
}

/**
 * Get all TypeScript/JavaScript files in a directory recursively
 */
function getAllTypeScriptFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllTypeScriptFiles(fullPath));
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}