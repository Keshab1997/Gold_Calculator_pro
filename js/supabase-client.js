// গোল্ড ক্যালকুলেটর অ্যাপের মেইন কনফিগারেশন

// আপনার সুপাবেস প্রজেক্টের URL এবং KEY (সরাসরি বসানো হলো যাতে কোনো এরর না হয়)
const supabaseUrl = 'https://vtqdqalsgudarirusahm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cWRxYWxzZ3VkYXJpcnVzYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTU4NzEsImV4cCI6MjA4MDg3MTg3MX0.AqsM7Fv4eTQ0VGNJfFk5NtEYh2C-QO0LZv7UboEl0UQ';

// চেক করা হচ্ছে যে Supabase CDN লোড হয়েছে কিনা
if (window.supabase && window.supabase.createClient) {
    
    // গ্লোবাল ভেরিয়েবল তৈরি করা হলো যাতে অন্য যেকোনো ফাইল থেকে এটি ব্যবহার করা যায়
    window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    console.log("✅ Supabase Connected Successfully!");
    
} else {
    // যদি ইনডেক্স ফাইলে স্ক্রিপ্ট মিসিং থাকে
    console.error("❌ Error: Supabase CDN link not found in HTML file.");
    alert("System Error: Database connection failed. Please reload.");
}