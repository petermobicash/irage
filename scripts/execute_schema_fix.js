#!/usr/bin/env node

/**
 * Direct SQL execution using Supabase Edge Functions
 * Creates a temporary edge function to execute the schema fix
 */

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs';

async function executeSchemaFix() {
    console.log('🔧 Executing page_content schema fix via edge function...');
    console.log('Creating temporary edge function to run SQL...');

    // Edge function code
    const edgeFunctionCode = `
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Import the Deno PostgreSQL module
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    
    const client = new Client({
      user: "postgres.xxxxxxxxxx",  // Will be replaced with actual connection string
      password: "xxxxxxxxxx",       // Will be replaced with actual password
      database: "postgres",
      hostname: "aws-0-us-west-1.pooler.supabase.com",
      port: 5432,
    });

    await client.connect();
    
    // Execute the schema fix
    console.log('Executing ALTER TABLE statement...');
    await client.queryObject('ALTER TABLE public.page_content ALTER COLUMN page_id TYPE TEXT;');
    
    console.log('Executing UPDATE statement...');
    await client.queryObject(\`
      UPDATE public.page_content 
      SET page_id = 'home' 
      WHERE page_id IS NOT NULL 
      AND page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved')
    \`);
    
    console.log('Adding constraint...');
    await client.queryObject('ALTER TABLE public.page_content DROP CONSTRAINT IF EXISTS valid_page_id;');
    await client.queryObject(\`
      ALTER TABLE public.page_content 
      ADD CONSTRAINT valid_page_id 
      CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'))
    \`);
    
    console.log('Creating index...');
    await client.queryObject('CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);');
    
    await client.close();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'page_content schema fix completed successfully!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error executing schema fix:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
`;

    // Since we can't easily create edge functions via API in this context,
    // let's try a different approach using raw SQL through a simpler method
    
    console.log('⚠️  Edge function approach requires deployment capabilities.');
    console.log('💡 Alternative: Manual execution via Supabase Dashboard or SQL Editor');
    console.log('');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('='.repeat(60));
    console.log(`
-- Fix page_content schema mismatch
-- Execute this in Supabase SQL Editor (https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/sql-editor)

BEGIN;

-- Change page_id from UUID to TEXT to match frontend expectations
ALTER TABLE public.page_content 
ALTER COLUMN page_id TYPE TEXT;

-- Update any existing records to have valid string identifiers
UPDATE public.page_content 
SET page_id = 'home' 
WHERE page_id IS NOT NULL 
AND page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved');

-- Add validation constraint for page_id values
ALTER TABLE public.page_content 
DROP CONSTRAINT IF EXISTS valid_page_id;
ALTER TABLE public.page_content 
ADD CONSTRAINT valid_page_id 
CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'));

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);

COMMIT;
`);
    console.log('='.repeat(60));
    console.log('');
    console.log('After executing the SQL, the XHR 400 error should be resolved!');
    
    return true;
}

executeSchemaFix();