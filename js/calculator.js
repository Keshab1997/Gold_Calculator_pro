// গোল্ড ক্যালকুলেটর লজিক এবং ডাটা ম্যানেজমেন্ট

// ১. পেজ লোড হলে চেক করবে ইউজার লগিন আছে কিনা
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            window.location.href = 'index.html'; 
        } else {
            console.log("Active User:", user.email);
            loadData(); 
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
});

// ২. লাইভ ক্যালকুলেশন (আপডেট করা লজিক)
function liveCalculate() {
    // ইনপুট ভ্যালু নেওয়া
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const makingRate = parseFloat(document.getElementById('making').value) || 0; // এটি এখন প্রতি গ্রামের রেট
    const lossPercent = parseFloat(document.getElementById('lossPercent').value) || 0;

    // A. Gold Value = ওজন x আজকের রেট
    const goldValue = weight * rate;

    // B. Loss Cost = (ওজন x লস%) x রেট
    const lossWeight = weight * (lossPercent / 100);
    const lossCost = lossWeight * rate;

    // C. Making Charge Calculation (NEW LOGIC)
    // লজিক: ওজন x মেকিং রেট (যেমন: 10gm * 50tk = 500tk)
    const totalMakingCost = weight * makingRate;

    // D. Grand Total
    const total = goldValue + lossCost + totalMakingCost;

    // ডিসপ্লে আপডেট
    document.getElementById('goldValue').innerText = goldValue.toFixed(2);
    
    // লস সেকশন
    document.getElementById('lossPShow').innerText = lossPercent;
    document.getElementById('lossCost').innerText = lossCost.toFixed(2);
    
    // মেকিং চার্জ সেকশন (এখন মোট মেকিং চার্জ দেখাবে)
    document.getElementById('makingCost').innerText = totalMakingCost.toFixed(2);
    
    // গ্র্যান্ড টোটাল
    document.getElementById('grandTotal').innerText = total.toFixed(2);
}

// ৩. ডাটা সেভ করার ফাংশন
async function calculateTotal(event) {
    event.preventDefault(); 

    const item = document.getElementById('item').value;
    const weight = document.getElementById('weight').value; 
    const total = document.getElementById('grandTotal').innerText;
    
    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

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

        alert('Calculation Saved Successfully!');
        
        document.getElementById('calcForm').reset();
        
        // ডিফল্ট ভ্যালু রিসেট
        document.getElementById('lossPercent').value = "10";
        document.getElementById('grandTotal').innerText = "0.00";
        document.getElementById('goldValue').innerText = "0.00";
        document.getElementById('lossCost').innerText = "0.00";
        document.getElementById('makingCost').innerText = "0.00";

        loadData();

    } catch (error) {
        alert('Error saving data: ' + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ৪. হিস্ট্রি টেবিল লোড করা (কোনো পরিবর্তন নেই)
async function loadData() {
    const tableBody = document.getElementById('historyTableBody');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        tableBody.innerHTML = ''; 

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #777;">No calculation history found.</td></tr>`;
            return;
        }

        data.forEach(row => {
            const dateObj = new Date(row.created_at);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
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