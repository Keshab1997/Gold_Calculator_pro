// js/auth.js

// ১. পেজ লোড হলে চেক করবে ইউজার লগিন আছে কিনা (অটোমেটিক রিডাইরেক্ট)
document.addEventListener('DOMContentLoaded', async () => {
    
    // বর্তমান পেজের নাম চেক করা হচ্ছে
    const path = window.location.pathname;
    const pageName = path.split("/").pop(); // যেমন: index.html বা dashboard.html
    
    // Supabase থেকে সেশন চেক করা
    const { data: { session } } = await supabase.auth.getSession();

    // লজিক ১: যদি ইউজার লগইন থাকে
    if (session) {
        // এবং ইউজার যদি এখন 'index.html' বা মেইন পেজে থাকে
        if (pageName === 'index.html' || pageName === '' || pageName === '/') {
            window.location.href = 'dashboard.html'; // ড্যাশবোর্ডে পাঠিয়ে দাও
        }
    } 
    // লজিক ২: যদি ইউজার লগইন না থাকে
    else {
        // এবং ইউজার যদি এখন 'dashboard.html' এ ঢোকার চেষ্টা করে
        if (pageName === 'dashboard.html') {
            window.location.href = 'index.html'; // লগইন পেজে পাঠিয়ে দাও
        }
    }
});

// ২. লগইন ফাংশন
async function handleLogin(event) {
    event.preventDefault(); // পেজ রিলোড বন্ধ করবে
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('message');
    const btn = document.getElementById('loginBtn');

    // লোডিং...
    btn.innerText = 'Processing...';
    btn.disabled = true;
    msgBox.innerText = ""; // আগের মেসেজ ক্লিয়ার

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        msgBox.innerText = "Login Successful! Redirecting...";
        msgBox.style.color = "green";
        
        // ১ সেকেন্ড পর ড্যাশবোর্ডে যাবে
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        msgBox.innerText = "Error: " + error.message;
        msgBox.style.color = "red";
    } finally {
        btn.innerText = 'Login';
        btn.disabled = false;
    }
}

// ৩. সাইন আপ ফাংশন
async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('message');
    const btn = document.getElementById('signupBtn');
    
    if (!email || !password) {
        msgBox.innerText = "Please enter email & password";
        msgBox.style.color = "red";
        return;
    }

    btn.innerText = 'Creating...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        msgBox.innerText = "Signup Successful! Check email or Log in.";
        msgBox.style.color = "green";

    } catch (error) {
        msgBox.innerText = "Error: " + error.message;
        msgBox.style.color = "red";
    } finally {
        btn.innerText = 'Sign Up';
        btn.disabled = false;
    }
}

// ৪. লগআউট ফাংশন (এটি ড্যাশবোর্ডের বাটনে কাজ করবে)
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // লগআউট সফল হলে লগইন পেজে ফেরত
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out!');
    }
}