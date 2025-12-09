// পেজ লোড হলে চেক করবে ইউজার আছে কিনা
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            // ইউজার না থাকলে লগিন পেজে পাঠাবে
            window.location.href = 'index.html'; 
        } else {
            console.log("User found:", user.email);
            loadData(); // লগিন থাকলে টেবিল লোড করবে
            
            // ওয়েলকাম মেসেজ (অপশনাল)
            // alert(`Welcome ${user.email}`);
        }
    } catch (error) {
        console.error("Auth Check Error:", error);
    }
});

// লাইভ ক্যালকুলেশন
function liveCalculate() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const making = parseFloat(document.getElementById('making').value) || 0;
    const lossPercent = parseFloat(document.getElementById('lossPercent').value) || 0;

    const goldValue = weight * rate;
    const lossWeight = weight * (lossPercent / 100);
    const lossCost = lossWeight * rate;
    const total = goldValue + lossCost + making;

    document.getElementById('goldValue').innerText = goldValue.toFixed(2);
    document.getElementById('lossPShow').innerText = lossPercent;
    document.getElementById('lossCost').innerText = lossCost.toFixed(2);
    document.getElementById('makingCost').innerText = making.toFixed(2);
    document.getElementById('grandTotal').innerText = total.toFixed(2);
}

// ডাটা সেভ করা
async function calculateTotal(event) {
    event.preventDefault();

    const item = document.getElementById('item').value;
    const weight = document.getElementById('weight').value;
    const total = document.getElementById('grandTotal').innerText;
    
    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('calculations')
            .insert([{ 
                user_id: user.id,
                item_name: item,
                weight: parseFloat(weight),
                total_price: parseFloat(total),
                created_at: new Date()
            }]);

        if (error) throw error;

        // সফল হলে
        // document.getElementById('calcForm').reset(); // ফর্ম রিসেট করতে চাইলে আনকমেন্ট করুন
        document.getElementById('grandTotal').innerText = "0.00";
        liveCalculate(); // রিসেট করার পর লাইভ ক্যালকুলেশন আপডেট
        loadData();      // টেবিল আপডেট
        alert('Saved Successfully!');

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.innerHTML = originalText;
    }
}

// হিস্ট্রি লোড করা
async function loadData() {
    const tableBody = document.getElementById('historyTableBody');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        tableBody.innerHTML = ''; // আগের লোডিং লেখা সরাবে

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">No history found. Start calculating!</td></tr>`;
            return;
        }

        data.forEach(row => {
            const dateObj = new Date(row.created_at);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const html = `
                <tr>
                    <td>${row.item_name}</td>
                    <td><strong>${row.weight}</strong> gm</td>
                    <td style="color: #28a745; font-weight:bold;">${row.total_price}</td>
                    <td style="font-size: 13px; color: #666;">${date}<br><small>${time}</small></td>
                </tr>
            `;
            tableBody.innerHTML += html;
        });

    } catch (error) {
        console.error('Error loading history:', error);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Failed to load data. Check console.</td></tr>`;
    }
}

// লগআউট
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}