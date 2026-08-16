require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log('No service key or url found, migration skipped locally.');
    return;
  }

  const supabase = createClient(url, key);
  console.log('Testing connection to movies table...');
  const { data, error } = await supabase.from('movies').select('id, download_links').limit(1);
  if (error) {
    console.log('Column download_links may not exist yet or error:', error.message);
  } else {
    console.log('Column download_links already exists or is accessible!');
  }
}

runMigration();
