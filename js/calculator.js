// গোল্ড ক্যালকুলেটর লজিক এবং ডাটা ম্যানেজমেন্ট

// ১. পেজ লোড হলে চেক করবে ইউজার লগিন আছে কিনা
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Supabase থেকে কারেন্ট ইউজার চেক করা
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            // ইউজার না থাকলে লগিন পেজে পাঠিয়ে দেবে
            window.location.href = 'index.html'; 
        } else {
            console.log("Active User:", user.email);
            loadData(); // ইউজার থাকলে তার আগের হিস্ট্রি লোড করবে
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
});

// ২. লাইভ ক্যালকুলেশন (টাইপ করার সাথে সাথে হিসাব হবে)
function liveCalculate() {
    // ইনপুট ভ্যালু নেওয়া (না থাকলে 0 ধরা হবে)
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const making = parseFloat(document.getElementById('making').value) || 0;
    const lossPercent = parseFloat(document.getElementById('lossPercent').value) || 0;

    // লজিক:
    // Gold Value = ওজন x আজকের রেট
    const goldValue = weight * rate;

    // Loss Cost = (ওজন x লস%) x রেট
    const lossWeight = weight * (lossPercent / 100);
    const lossCost = lossWeight * rate;

    // Grand Total = Gold Value + Loss Cost + Making Charge
    const total = goldValue + lossCost + making;

    // ডিসপ্লে আপডেট (টাকার ক্ষেত্রে ২ দশমিক, ওজনের ক্ষেত্রে ৩ দশমিক লজিক ইনপুটে আছে)
    document.getElementById('goldValue').innerText = goldValue.toFixed(2);
    document.getElementById('lossPShow').innerText = lossPercent;
    document.getElementById('lossCost').innerText = lossCost.toFixed(2);
    document.getElementById('makingCost').innerText = making.toFixed(2);
    document.getElementById('grandTotal').innerText = total.toFixed(2);
}

// ৩. ডাটা সেভ করার ফাংশন
async function calculateTotal(event) {
    event.preventDefault(); // পেজ রিলোড বন্ধ করবে

    const item = document.getElementById('item').value;
    const weight = document.getElementById('weight').value; // ৩ দশমিক স্ট্রিং হিসেবে নিচ্ছি
    const total = document.getElementById('grandTotal').innerText;
    
    // বাটনে লোডিং এনিমেশন
    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        // ডাটাবেসে ডাটা পাঠানো
        const { error } = await supabase
            .from('calculations')
            .insert([{ 
                user_id: user.id,
                item_name: item,
                weight: parseFloat(weight), // ডাটাবেসে নাম্বার হিসেবে যাবে
                total_price: parseFloat(total),
                created_at: new Date()
            }]);

        if (error) throw error;

        // সফল হলে
        alert('Calculation Saved Successfully!');
        
        // ফর্ম রিসেট করা (যাতে নতুন হিসাব করা যায়)
        document.getElementById('calcForm').reset();
        
        // ডিফল্ট ভ্যালু পুনরায় সেট করা
        document.getElementById('lossPercent').value = "10";
        document.getElementById('grandTotal').innerText = "0.00";
        document.getElementById('goldValue').innerText = "0.00";
        document.getElementById('lossCost').innerText = "0.00";
        document.getElementById('makingCost').innerText = "0.00";

        // টেবিল আপডেট
        loadData();

    } catch (error) {
        alert('Error saving data: ' + error.message);
    } finally {
        // বাটন আগের অবস্থায় ফেরত আনা
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ৪. হিস্ট্রি টেবিল লোড করা
async function loadData() {
    const tableBody = document.getElementById('historyTableBody');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // ডাটাবেস থেকে ডাটা আনা (লেটেস্ট আগে)
        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20); // সর্বশেষ ২০টি দেখাবে

        if (error) throw error;

        tableBody.innerHTML = ''; // লোডিং লেখা সরিয়ে ফেলা

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #777;">No calculation history found.</td></tr>`;
            return;
        }

        // লুপ চালিয়ে টেবিলে ডাটা বসানো
        data.forEach(row => {
            const dateObj = new Date(row.created_at);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // ওজনকে ৩ দশমিক পর্যন্ত দেখানো (যেমন: 10.023)
            const formattedWeight = parseFloat(row.weight).toFixed(3);

            const html = `
                <tr>
                    <td>${row.item_name}</td>
                    <td><strong>${formattedWeight}</strong> gm</td>
                    <td style="color: #28a745; font-weight:bold;">${parseFloat(row.total_price).toFixed(2)}</td>
                    <td style="font-size: 12px; color: #666;">
                        ${date}<br>${time}
                    </td>
                </tr>
            `;
            tableBody.innerHTML += html;
        });

    } catch (error) {
        console.error('Error loading history:', error);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Failed to load data.</td></tr>`;
    }
}