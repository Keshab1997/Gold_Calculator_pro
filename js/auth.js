// js/auth.js

// ১. পেজ লোড হলে চেক করবে ইউজার লগিন আছে কিনা
document.addEventListener('DOMContentLoaded', async () => {
    // শুধুমাত্র index.html এ এই চেকটি হবে
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            window.location.href = 'dashboard.html';
        }
    }
});

// ২. লগিন ফাংশন
async function handleLogin(event) {
    event.preventDefault(); // পেজ রিলোড বন্ধ করবে
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('message');
    const btn = document.getElementById('loginBtn');

    // লোডিং...
    btn.innerText = 'Processing...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        msgBox.innerText = "Success! Redirecting...";
        msgBox.style.color = "green";
        
        // ১ সেকেন্ড পর ড্যাশবোর্ডে যাবে
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        msgBox.innerText = error.message;
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
    
    if (!email || !password) {
        msgBox.innerText = "Please enter email & password";
        msgBox.style.color = "red";
        return;
    }

    const btn = document.getElementById('signupBtn');
    btn.innerText = 'Creating...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        msgBox.innerText = "Signup Successful! Log in now.";
        msgBox.style.color = "green";

    } catch (error) {
        msgBox.innerText = error.message;
        msgBox.style.color = "red";
    } finally {
        btn.innerText = 'Sign Up';
        btn.disabled = false;
    }
}

// ৪. লগআউট ফাংশন (এটি ড্যাশবোর্ডে কাজ করবে)
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}