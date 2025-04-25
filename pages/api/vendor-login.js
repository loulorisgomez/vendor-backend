import { createClient } from '@supabase/supabase-js';
console.log("🚀 API route loaded: vendor-login.js");


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data?.user) {
console.log("❌ Supabase login error:", error);
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('email', email)
    .maybeSingle();

console.log('🔍 Looking for vendor using email:', email);
console.log('📦 vendorData:', vendorData);
console.log('⚠️ vendorError:', vendorError);


  if (vendorError) {
    return res.status(200).json({
      message: 'Login successful, but vendor profile not found.',
      user: data.user,
      vendor: null
    });
  }

  return res.status(200).json({
    message: 'Login successful',
    user: data.user,
    vendor: vendorData
  });
}
