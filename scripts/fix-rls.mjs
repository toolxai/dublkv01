import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
  ?.replace('https://', '')
  .replace('.supabase.co', '') || '';

const token = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const query = `
  -- Allow admins to manage all purchases
  DROP POLICY IF EXISTS "Admins can manage all purchases" ON public.purchases;
  CREATE POLICY "Admins can manage all purchases" ON public.purchases
    FOR ALL USING (
      (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
    );
`;

async function run() {
  console.log("Running SQL to fix RLS...");
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Error:', text);
  } else {
    console.log('Success!', await res.json());
  }
}
run();
