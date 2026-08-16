require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Try pg endpoint
  try {
    const res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: "ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS download_links JSONB DEFAULT '[]'::jsonb;" })
    });
    console.log('pg/query status:', res.status, await res.text());
  } catch (e) {
    console.log('pg/query error:', e.message);
  }

  // Check again
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('movies').select('id, download_links').limit(1);
  if (error) {
    console.log('download_links check:', error.message);
  } else {
    console.log('SUCCESS! download_links column is active!');
  }
}

applyMigration();
