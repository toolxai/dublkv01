// Run: SUPABASE_SERVICE_ROLE_KEY=xxx node supabase/run-migration-servers.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log('Running server columns migration...');

  // Check connection
  const { error: testErr } = await supabase.from('movies').select('id').limit(1);
  if (testErr) { console.error('Connection error:', testErr.message); process.exit(1); }
  console.log('✓ Connected');

  // Check if free_servers column exists
  const { data: cols } = await supabase.rpc('exec_sql', {
    sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='movies' AND column_name IN ('free_servers','vip_servers')`
  }).catch(() => ({ data: null }));

  // Just print the SQL to run manually
  const sql = readFileSync('./supabase/migration_servers.sql', 'utf8');
  console.log('\n📋 Run this SQL in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/jpkcywwrszbypoivftea/sql/new\n');
  console.log(sql);
}

run().catch(console.error);
