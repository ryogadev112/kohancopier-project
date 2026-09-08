const ADMIN_WA = "6281318541990";

// --- FITUR AUTO-FILL CUSTOMER LAMA ---
window.addEventListener('DOMContentLoaded', () => {
    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    if(riwayat.length > 0) {
        let lastOrder = riwayat[riwayat.length - 1];
        const inputNama = document.getElementById('nama');
        const inputPhone = document.getElementById('phone');
        if (inputNama) inputNama.value = lastOrder.nama || '';
        if (inputPhone) inputPhone.value = lastOrder.phone || '';
    }
});

// --- KALKULASI HARGA REAL-TIME ---
const jumlahHalamanInput = document.getElementById('jumlahHalaman');
const jumlahCopyInput = document.getElementById('jumlahCopy');
const radiosCetak = document.querySelectorAll('input[name="jenisCetak"]');
const pricePreview = document.getElementById('pricePreview');

function updatePrice() {
    const hal = parseInt(jumlahHalamanInput.value) || 1;
    const copy = parseInt(jumlahCopyInput.value) || 1;
    
    const checkedRadio = document.querySelector('input[name="jenisCetak"]:checked');
    const jenis = checkedRadio ? checkedRadio.value : 'Hitam Putih';
    
    const hargaPerHal = jenis === 'Warna' ? 2000 : 1000;
    const total = hal * copy * hargaPerHal;
    
    if(pricePreview) {
        pricePreview.innerText = "Rp " + total.toLocaleString('id-ID');
    }
}

// Pasang Event Listener Form
if (jumlahHalamanInput && jumlahCopyInput) {
    jumlahHalamanInput.addEventListener('input', updatePrice);
    jumlahCopyInput.addEventListener('input', updatePrice);
    radiosCetak.forEach(radio => radio.addEventListener('change', updatePrice));
}

// --- LOGIKA TIMER INVOICE ---
let countdownInterval;
function startInvoiceTimer(durationInSeconds) {
    clearInterval(countdownInterval);
    let timer = durationInSeconds;
    const timerDisplay = document.getElementById('invoiceTimer');
    
    countdownInterval = setInterval(() => {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timerDisplay) {
            timerDisplay.innerText = "⏱️ " + minutes + ":" + seconds;
        }

        if (--timer < 0) {
            clearInterval(countdownInterval);
            if (timerDisplay) {
                timerDisplay.innerText = "⏱️ Waktu Habis!";
                timerDisplay.style.background = "#fee2e2";
            }
        }
    }, 1000);
}

// --- LOGIKA FORM & MODAL ---
let tempOrderData = null;
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nama = document.getElementById('nama').value;
        const phone = document.getElementById('phone').value;
        const jumlahHalaman = document.getElementById('jumlahHalaman').value;
        const jumlahCopy = document.getElementById('jumlahCopy').value;
        const jenisCetak = document.querySelector('input[name="jenisCetak"]:checked').value;
        const ukuranKertas = document.getElementById('ukuranKertas').value;
        const catatan = document.getElementById('catatan').value || '-';
        const fileInput = document.getElementById('file');
        const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Tidak ada file';

        const orderId = 'KC-' + Math.floor(1000000000 + Math.random() * 9000000000);
        const hargaPerHal = jenisCetak === 'Warna' ? 2000 : 1000;
        const totalHarga = jumlahHalaman * jumlahCopy * hargaPerHal;

        tempOrderData = {
            orderId, nama, phone, jumlahHalaman, jumlahCopy, jenisCetak, ukuranKertas, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
        };

        // Render ke Modal
        document.getElementById('mNama').innerText = nama;
        document.getElementById('mPhone').innerText = phone;
        document.getElementById('mDetail').innerText = `${jumlahHalaman} Hal x ${jumlahCopy} Rangkap (${jenisCetak} - ${ukuranKertas})`;
        document.getElementById('mTotal').innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');

        document.getElementById('confirmModal').style.display = 'flex';
    });
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// --- LANJUTKAN KE INVOICE ---
const btnProceedInvoice = document.getElementById('btnProceedInvoice');
if (btnProceedInvoice) {
    btnProceedInvoice.onclick = function() {
        if (!tempOrderData) return;

        let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
        riwayat.push(tempOrderData);
        localStorage.setItem('kohancopier_orders', JSON.stringify(riwayat));

        document.getElementById('invId').innerText = tempOrderData.orderId;
        document.getElementById('invNama').innerText = tempOrderData.nama + ' (' + tempOrderData.phone + ')';
        document.getElementById('invDetail').innerText = `${tempOrderData.jumlahHalaman} Hal x ${tempOrderData.jumlahCopy} Rangkap (${tempOrderData.jenisCetak} - ${tempOrderData.ukuranKertas})\nFile: ${tempOrderData.fileName}`;
        document.getElementById('invTotal').innerText = 'Rp ' + tempOrderData.totalHarga.toLocaleString('id-ID');

        // Update Pesan WA Admin dengan format detail lengkap
        const pesanWA = `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*ID Invoice:* ${tempOrderData.orderId}\n*Nama:* ${tempOrderData.nama}\n*Detail:* ${tempOrderData.jumlahHalaman} Hal x ${tempOrderData.jumlahCopy} Rangkap (${tempOrderData.jenisCetak} - ${tempOrderData.ukuranKertas})\n*Catatan:* ${tempOrderData.catatan}\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;
        document.getElementById('btnInvWA').href = `https://wa.me/${ADMIN_WA}?text=` + encodeURIComponent(pesanWA);

        closeConfirmModal();
        const navInvoice = document.getElementById('nav-invoice');
        if (navInvoice) navInvoice.style.display = 'block';

        // Panggil dari fungsi global HTML
        if(typeof window.switchPage === 'function'){
            window.switchPage('invoice');
        }
        
        startInvoiceTimer(600);

        // Jangan reset nama dan phone karena ini berguna untuk order selanjutnya
        const currentNama = document.getElementById('nama').value;
        const currentPhone = document.getElementById('phone').value;
        orderForm.reset();
        document.getElementById('nama').value = currentNama;
        document.getElementById('phone').value = currentPhone;
        
        updatePrice();
    };
}

// --- LOGIKA LACAK PESANAN ---
function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    if (!keyword) {
        alert('Masukkan ID Pesanan atau No WhatsApp!');
        return;
    }

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    const found = riwayat.filter(o => o.orderId.toLowerCase().includes(keyword.toLowerCase()) || o.phone.includes(keyword));

    resultDiv.style.display = 'block';
    if (found.length > 0) {
        let html = '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">';
        found.forEach(o => {
            html += `<p style="margin:4px 0;"><b>ID:</b> ${o.orderId} | <b>Nama:</b> ${o.nama} | <b>Status:</b> <span style="color:#d97706; font-weight:bold;">${o.status}</span></p>`;
            // Handle pesanan lama yang tidak punya jumlahCopy atau ukuranKertas
            let copy = o.jumlahCopy ? `${o.jumlahCopy} Rangkap` : '';
            let kertas = o.ukuranKertas ? `- ${o.ukuranKertas}` : '';
            html += `<p style="margin:4px 0; color:#64748b;">Detail: ${o.jumlahHalaman} Hal ${copy} (${o.jenisCetak} ${kertas}) - Total: Rp ${o.totalHarga.toLocaleString('id-ID')}</p><hr style="border:0; border-top:1px solid #eee; margin:8px 0;">`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0;">Pesanan tidak ditemukan. Pastikan ID atau No WA benar.</p>';
    }
}