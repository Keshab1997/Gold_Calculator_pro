// js/auth.js

// সাইন আপ ফাংশন
async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await window.db.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        document.getElementById('message').innerText = "Error: " + error.message;
    } else {
        document.getElementById('message').innerText = "Check your email for confirmation link!";
    }
}

// লগিন ফাংশন
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await window.db.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        document.getElementById('message').innerText = "Login Failed: " + error.message;
    } else {
        // লগিন সফল হলে ড্যাশবোর্ডে নিয়ে যাবে
        window.location.href = "dashboard.html";
    }
}

// ইউজার অলরেডি লগিন করা থাকলে চেক করা
async function checkUser() {
    const { data: { session } } = await window.db.auth.getSession();
    if (session) {
        window.location.href = "dashboard.html";
    }
}
checkUser();