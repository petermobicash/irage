import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function pushSeed() {
  try {
    console.log('📦 Reading seed file...');
    const seedPath = join(__dirname, '..', 'supabase', 'seed.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');

    console.log('🚀 Executing seed data...');
    
    // Execute the seed SQL using the Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: seedSQL
    });

    if (error) {
      // If exec_sql function doesn't exist, try direct execution via postgres
      console.log('⚠️  exec_sql function not found, trying alternative method...');
      
      // Split the SQL into individual statements and execute them
      const statements = seedSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('DO $$') || statement.includes('INSERT INTO')) {
          console.log(`Executing statement: ${statement.substring(0, 50)}...`);
          
          // For DO blocks and INSERT statements, we need to use the postgres connection
          // This requires using psql or a direct postgres client
          console.log('⚠️  This statement requires direct database access');
        }
      }
      
      console.log('\n❌ Unable to execute seed directly via Supabase client.');
      console.log('📝 Please use one of these methods instead:');
      console.log('\n1. Via Supabase Dashboard:');
      console.log('   - Go to https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/editor');
      console.log('   - Open SQL Editor');
      console.log('   - Copy and paste the contents of supabase/seed.sql');
      console.log('   - Click "Run"');
      console.log('\n2. Via psql command line:');
      console.log('   psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" -f supabase/seed.sql');
      console.log('\n3. Via Supabase CLI with password:');
      console.log('   npx supabase db push --linked --include-seed -p [YOUR-PASSWORD]');
      
      process.exit(1);
    }

    console.log('✅ Seed data pushed successfully!');
    console.log(data);
    
  } catch (error) {
    console.error('❌ Error pushing seed data:', error.message);
    process.exit(1);
  }
}

pushSeed();