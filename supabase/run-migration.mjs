// Run: node supabase/run-migration.mjs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jpkcywwrszbypoivftea.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function runMigration() {
  console.log('Running migration...');

  // Test connection first
  const { data: test, error: testErr } = await supabase
    .from('movies')
    .select('id')
    .limit(1);

  if (testErr) {
    console.error('Connection error:', testErr.message);
    process.exit(1);
  }
  console.log('✓ Connected to Supabase');

  // Check if columns already exist by querying information_schema
  const { data: cols } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'movies')
    .in('column_name', ['server1_url', 'server2_url']);

  if (cols && cols.length >= 2) {
    console.log('✓ Columns already exist — migration already applied!');
    return;
  }

  console.log('Columns missing — need to add them via Supabase Dashboard.');
  console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
  console.log('Go to: https://supabase.com/dashboard/project/jpkcywwrszbypoivftea/sql/new\n');
  console.log('--- COPY THIS SQL ---');
  console.log(`
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS server1_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS server2_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_trial_expires_at TIMESTAMPTZ;
  `.trim());
  console.log('---');
}

runMigration().catch(console.error);
