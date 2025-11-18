import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://qlnpzqorijdcbcgajuei.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbnB6cW9yaWpkY2JjZ2FqdWVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ1NjAzNSwiZXhwIjoyMDc3MDMyMDM1fQ.3EqzvRQdo7XE4lh8bAkwEqIik3gJmywAOOaH4LcOqCs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename, sql) {
  console.log(`\n📝 Running migration: ${filename}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Error in ${filename}:`, error.message);
      return false;
    }
    
    console.log(`✅ Successfully applied: ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${filename}:`, err.message);
    return false;
  }
}

async function pushMigrations() {
  console.log('🚀 Starting migration push to Supabase...\n');
  console.log(`📍 Project: ${SUPABASE_URL}`);
  
  const migrationsDir = join(__dirname, '../supabase/migrations');
  
  // Get all SQL files and sort them
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('.broken'))
    .sort();
  
  console.log(`\n📦 Found ${files.length} migration files\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');
    
    const success = await runMigration(file, sql);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log('\n⚠️  Migration failed. Continue? (Ctrl+C to abort)');
      // Give user time to see the error
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (failCount === 0) {
    console.log('🎉 All migrations applied successfully!');
  } else {
    console.log('⚠️  Some migrations failed. Check the errors above.');
    console.log('💡 Tip: You may need to run failed migrations manually in Supabase Dashboard.');
  }
}

// Alternative: Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql helper function...\n');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL });
    if (error) {
      console.log('ℹ️  Note: exec_sql function may not exist. Using alternative method...\n');
      return false;
    }
    console.log('✅ Helper function created\n');
    return true;
  } catch (err) {
    console.log('ℹ️  Using alternative migration method...\n');
    return false;
  }
}

// Run the migration
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         Supabase Migration Push Tool                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

pushMigrations().catch(err => {
  console.error('\n💥 Fatal error:', err);
  console.log('\n📖 Alternative: Use the Supabase Dashboard SQL Editor');
  console.log('   1. Go to: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/sql');
  console.log('   2. Copy contents from: combined_migrations.sql');
  console.log('   3. Paste and run in the SQL Editor\n');
  process.exit(1);
});