// পেজ লোড হলে ডাটা আনবে এবং ইউজার চেক করবে
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html'; // লগিন না থাকলে বের করে দেবে
    } else {
        loadData(); // লগিন থাকলে টেবিল লোড করবে
    }
});

// লাইভ ক্যালকুলেশন ফাংশন (টাইপ করার সাথে সাথে রেজাল্ট দেখাবে)
function liveCalculate() {
    // ইনপুট ভ্যালু নেওয়া
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const making = parseFloat(document.getElementById('making').value) || 0;
    const lossPercent = parseFloat(document.getElementById('lossPercent').value) || 0;

    // ১. সোনার আসল দাম (Gold Value)
    const goldValue = weight * rate;

    // ২. লস ক্যালকুলেশন (Loss Cost)
    // লস সাধারণত ওজনের ওপর পার্সেন্টেজ হয়, তারপর সেটা রেট দিয়ে গুণ হয়
    // অথবা লস ওজনের সাথে যোগ হয়ে রেট দিয়ে গুণ হয়। এখানে সহজ পদ্ধতি দেওয়া হলো:
    // Loss Cost = (Weight * Loss%) * Rate
    const lossWeight = weight * (lossPercent / 100);
    const lossCost = lossWeight * rate;

    // ৩. টোটাল
    const total = goldValue + lossCost + making;

    // ৪. ডিসপ্লে আপডেট (toFixed(2) মানে দশমিকের পর ২ ঘর)
    document.getElementById('goldValue').innerText = goldValue.toFixed(2);
    document.getElementById('lossPShow').innerText = lossPercent;
    document.getElementById('lossCost').innerText = lossCost.toFixed(2);
    document.getElementById('makingCost').innerText = making.toFixed(2);
    document.getElementById('grandTotal').innerText = total.toFixed(2);
}

// ডাটা সেভ এবং সাবমিট ফাংশন
async function calculateTotal(event) {
    event.preventDefault(); // ফর্ম রিলোড বন্ধ করবে

    const item = document.getElementById('item').value;
    const weight = document.getElementById('weight').value; // String হিসেবে নিচ্ছি দশমিক ঠিক রাখার জন্য
    const total = document.getElementById('grandTotal').innerText;

    // সেভিং এনিমেশন (বাটনের টেক্সট চেঞ্জ)
    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Supabase এ ডাটা পাঠানো
        const { error } = await supabase
            .from('calculations')
            .insert([
                { 
                    user_id: user.id,
                    item_name: item,
                    weight: parseFloat(weight), // 10.023 হিসেবে যাবে
                    total_price: parseFloat(total),
                    created_at: new Date()
                }
            ]);

        if (error) throw error;

        // সাকসেস মেসেজ
        alert('Calculation Saved Successfully!');
        document.getElementById('calcForm').reset(); // ফর্ম ক্লিয়ার
        document.getElementById('grandTotal').innerText = "0.00"; // টোটাল রিসেট
        loadData(); // টেবিল আপডেট

    } catch (error) {
        console.error('Error:', error);
        alert('Error saving data: ' + error.message);
    } finally {
        btn.innerHTML = originalText; // বাটন আগের অবস্থায়
    }
}

// টেবিল ডাটা লোড করার ফাংশন
async function loadData() {
    const tableBody = document.getElementById('historyTableBody');
    
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id) // শুধু এই ইউজারের ডাটা আনবে
        .order('created_at', { ascending: false })
        .limit(10); // লাস্ট ১০টা দেখাবে

    if (error) {
        console.error('Error loading history:', error);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Error loading data</td></tr>`;
    } else {
        tableBody.innerHTML = ''; // টেবিল ক্লিয়ার

        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No history found</td></tr>`;
            return;
        }

        data.forEach(row => {
            const date = new Date(row.created_at).toLocaleDateString() + ' ' + new Date(row.created_at).toLocaleTimeString();
            const html = `
                <tr>
                    <td>${row.item_name}</td>
                    <td><strong>${row.weight}</strong> gm</td>
                    <td style="color: green; font-weight:bold;">${row.total_price}</td>
                    <td style="font-size: 12px; color: #777;">${date}</td>
                </tr>
            `;
            tableBody.innerHTML += html;
        });
    }
}

// লগআউট ফাংশন
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}