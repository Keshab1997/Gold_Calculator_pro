// ১. আপনার সুপাবেস URL এবং Key এখানে সরাসরি বসান
const supabaseUrl = 'https://vtqdqalsgudarirusahm.supabase.co'; // আপনার URL দিন
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cWRxYWxzZ3VkYXJpcnVzYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTU4NzEsImV4cCI6MjA4MDg3MTg3MX0.AqsM7Fv4eTQ0VGNJfFk5NtEYh2C-QO0LZv7UboEl0UQ'; // আপনার পুরো ANON KEY দিন

// ২. ক্লায়েন্ট তৈরি করে window তে সেট করা হচ্ছে যাতে সব ফাইলে পাওয়া যায়
if (window.supabase && window.supabase.createClient) {
    window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase initialized successfully!");
} else {
    console.error("Supabase CDN not loaded!");
}