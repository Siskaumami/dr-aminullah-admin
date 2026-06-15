// admin/assets/supabase-config.js

const supabaseUrl = 'https://sqkjkabbbmouarbqafea.supabase.co';
const supabaseKey = 'sb_publishable_yzoTLxJ-9odTyTRdv-9Vfw_0vGsFoaf';

// Kita menggunakan nama 'supabaseClient' agar tidak bentrok dengan library CDN bawaan browser
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);