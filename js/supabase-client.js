// js/supabase-client.js
// Supabase গ্লোবাল ভেরিয়েবল চেক করা হচ্ছে
if (typeof supabase === 'undefined') {
    console.error("Supabase SDK not loaded!");
}

const { createClient } = supabase;
const _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// অন্যদের ব্যবহারের জন্য এক্সপোর্ট করা হলো
window.db = _supabase;