// গোল্ড ক্যালকুলেটর: PDF, Edit, Delete এবং Logic সহ

// ১. পেজ লোড এবং অথেন্টিকেশন চেক
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

// ২. লাইভ ক্যালকুলেশন
function liveCalculate() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const makingRate = parseFloat(document.getElementById('making').value) || 0; // প্রতি গ্রামের মজুরি
    const lossPercent = parseFloat(document.getElementById('lossPercent').value) || 0;

    // A. Gold Value = ওজন x আজকের রেট
    const goldValue = weight * rate;

    // B. Loss Cost = (ওজন x লস%) x রেট
    const lossWeight = weight * (lossPercent / 100);
    const lossCost = lossWeight * rate;

    // C. Making Charge = ওজন x মেকিং রেট
    const totalMakingCost = weight * makingRate;

    // D. Grand Total
    const total = goldValue + lossCost + totalMakingCost;

    // ডিসপ্লে আপডেট
    document.getElementById('goldValue').innerText = goldValue.toFixed(2);
    document.getElementById('lossPShow').innerText = lossPercent;
    document.getElementById('lossCost').innerText = lossCost.toFixed(2);
    document.getElementById('makingCost').innerText = totalMakingCost.toFixed(2);
    document.getElementById('grandTotal').innerText = total.toFixed(2);
}

// ৩. ডাটা সেভ বা আপডেট করার ফাংশন (Edit Logic সহ)
async function calculateTotal(event) {
    event.preventDefault(); 

    // ইনপুট ভ্যালু নেওয়া
    const item = document.getElementById('item').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const makingRate = parseFloat(document.getElementById('making').value);
    const lossPercent = parseFloat(document.getElementById('lossPercent').value);
    const total = parseFloat(document.getElementById('grandTotal').innerText);
    
    // এডিট মোড চেক করা (লুকানো ID ফিল্ডে ভ্যালু আছে কিনা)
    const editId = document.getElementById('editId').value;

    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        let error;

        // যে ডাটাগুলো সেভ হবে
        const payload = { 
            user_id: user.id,
            item_name: item,
            weight: weight,
            gold_rate: rate,          // এডিটের জন্য সেভ রাখছি
            making_rate: makingRate,  // এডিটের জন্য সেভ রাখছি
            loss_percent: lossPercent,// এডিটের জন্য সেভ রাখছি
            total_price: total,
            created_at: new Date()    // আপডেটের সময় টাইম চেঞ্জ হবে
        };

        if (editId) {
            // যদি এডিট ID থাকে, তাহলে UPDATE হবে
            const response = await supabase
                .from('calculations')
                .update(payload)
                .eq('id', editId); // যেই ID মিলবে সেটি আপডেট হবে
            error = response.error;
        } else {
            // ID না থাকলে নতুন INSERT হবে
            const response = await supabase
                .from('calculations')
                .insert([payload]);
            error = response.error;
        }

        if (error) throw error;

        alert(editId ? 'Calculation Updated!' : 'Calculation Saved!');
        
        resetForm(); // ফর্ম পরিষ্কার করা
        loadData();  // টেবিল রিফ্রেশ

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ৪. ফর্ম রিসেট করার ফাংশন
function resetForm() {
    document.getElementById('calcForm').reset();
    document.getElementById('editId').value = ""; // ID মুছে ফেলা
    document.querySelector('.save-btn').innerHTML = '<i class="fa-solid fa-save"></i> Calculate & Save'; // বাটন টেক্সট নরমাল করা
    
    // ডিফল্ট ভ্যালু রিসেট
    document.getElementById('lossPercent').value = "10";
    document.getElementById('grandTotal').innerText = "0.00";
    document.getElementById('goldValue').innerText = "0.00";
    document.getElementById('lossCost').innerText = "0.00";
    document.getElementById('makingCost').innerText = "0.00";
}

// ৫. হিস্ট্রি লোড করা (Edit & Delete বাটন সহ)
async function loadData() {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';
    
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        tableBody.innerHTML = ''; 

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #777;">No history found.</td></tr>`;
            return;
        }

        data.forEach(row => {
            const dateObj = new Date(row.created_at);
            const date = dateObj.toLocaleDateString();
            
            const html = `
                <tr>
                    <td>${row.item_name}</td>
                    <td>${parseFloat(row.weight).toFixed(3)} gm</td>
                    <td style="color: #28a745; font-weight:bold;">${parseFloat(row.total_price).toFixed(2)}</td>
                    <td style="font-size: 12px;">${date}</td>
                    <td>
                        <!-- এডিট বাটন -->
                        <button onclick="editItem('${row.id}')" style="cursor:pointer; background:none; border:none; color:#2980b9; margin-right:5px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <!-- ডিলিট বাটন -->
                        <button onclick="deleteItem('${row.id}')" style="cursor:pointer; background:none; border:none; color:#c0392b;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += html;
        });

    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to load.</td></tr>`;
    }
}

// ৬. এডিট বাটন ক্লিক করলে যা হবে
async function editItem(id) {
    try {
        // ডাটাবেস থেকে ওই নির্দিষ্ট লাইনের সব তথ্য আনা
        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .eq('id', id)
            .single(); // একটি মাত্র row আনবে

        if (error) throw error;

        // ফর্মের ইনপুটগুলোতে ডাটা বসানো
        document.getElementById('editId').value = data.id;
        document.getElementById('item').value = data.item_name;
        document.getElementById('weight').value = data.weight;
        
        // যদি আগের ডাটাবেসে এই কলামগুলো না থাকে, তবে ০ বসাবে
        document.getElementById('rate').value = data.gold_rate || 0;
        document.getElementById('making').value = data.making_rate || 0;
        document.getElementById('lossPercent').value = data.loss_percent || 10;

        // লাইভ ক্যালকুলেশন কল করা যাতে টোটাল আপডেট হয়
        liveCalculate();

        // বাটনের নাম পরিবর্তন করা
        const btn = document.querySelector('.save-btn');
        btn.innerHTML = '<i class="fa-solid fa-pen-nib"></i> Update Calculation';
        
        // স্ক্রল করে উপরে ফর্মের কাছে নিয়ে যাওয়া
        document.querySelector('.calculation-card').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert('Error loading item: ' + error.message);
    }
}

// ৭. ডিলিট করার ফাংশন
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
        const { error } = await supabase
            .from('calculations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // সফল হলে টেবিল রিলোড
        loadData();

    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}

// ৮. PDF ডাউনলোড ফাংশন
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    
    // নতুন PDF ডকুমেন্ট তৈরি
    const doc = new jsPDF();

    // হেডার
    doc.setFontSize(18);
    doc.text("Gold Calculation History", 14, 20);
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleString(), 14, 28);

    // টেবিল তৈরি (jspdf-autotable ব্যবহার করে)
    doc.autoTable({
        html: '.data-table', // HTML টেবিলের ক্লাস নাম
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }, // হেডারের কালার (Blue)
        columns: [
            { header: 'Item', dataKey: 0 },
            { header: 'Weight', dataKey: 1 },
            { header: 'Total Price', dataKey: 2 },
            { header: 'Date', dataKey: 3 }
            // অ্যাকশন বাটন PDF এ দেখাবো না
        ],
        didParseCell: function (data) {
            // ৫ নম্বর কলাম (অ্যাকশন বাটন) হাইড করা
            if (data.column.index === 4) {
                data.cell.styles.fontSize = 0; 
                data.cell.content = '';
            }
        }
    });

    // ডাউনলোড করা
    doc.save("gold_history.pdf");
}