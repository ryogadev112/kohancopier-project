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

if (jumlahHalamanInput && jumlahCopyInput) {
    jumlahHalamanInput.addEventListener('input', updatePrice);
    jumlahCopyInput.addEventListener('input', updatePrice);
    radiosCetak.forEach(radio => radio.addEventListener('change', updatePrice));
}

// --- LOGIKA TIMER INVOICE DENGAN EFEK URGENSI ---
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
            
            // Efek Urgensi: Jika waktu di bawah 2 menit (120 detik), ubah warna & buat berkedip
            if (timer <= 120) {
                timerDisplay.style.background = "#fee2e2";
                timerDisplay.style.color = "#dc2626";
                timerDisplay.style.border = "1px solid #f87171";
                timerDisplay.style.animation = "pulse 1s infinite";
            }
        }

        if (--timer < 0) {
            clearInterval(countdownInterval);
            if (timerDisplay) {
                timerDisplay.innerText = "⏱️ Waktu Habis!";
                timerDisplay.style.background = "#fee2e2";
                timerDisplay.style.animation = "none";
            }
        }
    }, 1000);
}

// --- VALIDASI & SUBMIT FORM DENGAN LOADING STATE ---
let tempOrderData = null;
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        // 1. Validasi Keamanan File (Client-Side Validation)
        if (file) {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
                alert('❌ Format file tidak didukung! Harap upload file berformat PDF atau DOCX.');
                return;
            }
            // Batasan ukuran maks 10MB
            if (file.size > 10 * 1024 * 1024) {
                alert('❌ Ukuran file terlalu besar! Maksimal 10MB.');
                return;
            }
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        
        // 2. Loading State pada Tombol
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Memproses Pesanan...</span>`;

        setTimeout(() => {
            const nama = document.getElementById('nama').value;
            const phone = document.getElementById('phone').value;
            const jumlahHalaman = document.getElementById('jumlahHalaman').value;
            const jumlahCopy = document.getElementById('jumlahCopy').value;
            const jenisCetak = document.querySelector('input[name="jenisCetak"]:checked').value;
            const ukuranKertas = document.getElementById('ukuranKertas').value;
            const catatan = document.getElementById('catatan').value || '-';
            const fileName = file ? file.name : 'Tidak ada file';

            const orderId = 'KC-' + Math.floor(1000000000 + Math.random() * 9000000000);
            const hargaPerHal = jenisCetak === 'Warna' ? 2000 : 1000;
            const totalHarga = jumlahHalaman * jumlahCopy * hargaPerHal;

            tempOrderData = {
                orderId, nama, phone, jumlahHalaman, jumlahCopy, jenisCetak, ukuranKertas, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
            };

            document.getElementById('mNama').innerText = nama;
            document.getElementById('mPhone').innerText = phone;
            document.getElementById('mDetail').innerText = `${jumlahHalaman} Hal x ${jumlahCopy} Rangkap (${jenisCetak} - ${ukuranKertas})`;
            document.getElementById('mTotal').innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');

            document.getElementById('confirmModal').style.display = 'flex';

            // Kembalikan tombol ke semula
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }, 500); // Simulasi jeda halus 0.5 detik
    });
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

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

        const pesanWA = `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*ID Invoice:* ${tempOrderData.orderId}\n*Nama:* ${tempOrderData.nama}\n*Detail:* ${tempOrderData.jumlahHalaman} Hal x ${tempOrderData.jumlahCopy} Rangkap (${tempOrderData.jenisCetak} - ${tempOrderData.ukuranKertas})\n*Catatan:* ${tempOrderData.catatan}\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;
        document.getElementById('btnInvWA').href = `https://wa.me/${ADMIN_WA}?text=` + encodeURIComponent(pesanWA);

        closeConfirmModal();
        const navInvoice = document.getElementById('nav-invoice');
        if (navInvoice) navInvoice.style.display = 'block';

        if(typeof window.switchPage === 'function'){
            window.switchPage('invoice');
        }
        
        startInvoiceTimer(600);

        const currentNama = document.getElementById('nama').value;
        const currentPhone = document.getElementById('phone').value;
        orderForm.reset();
        document.getElementById('nama').value = currentNama;
        document.getElementById('phone').value = currentPhone;
        
        updatePrice();
    };
}

// --- LACAK PESANAN DENGAN EMPTY STATE YANG INFORMATIF ---
function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    resultDiv.style.display = 'block';

    if (!keyword) {
        resultDiv.innerHTML = '<p style="color: #d97706; font-size: 13px; margin:0; background: #fef3c7; padding: 10px; border-radius: 6px;">⚠️ Masukkan ID Pesanan (contoh: KC-123456) atau Nomor WhatsApp yang digunakan saat memesan.</p>';
        return;
    }

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    
    // Empty state jika sama sekali belum ada data pesanan di browser
    if (riwayat.length === 0) {
        resultDiv.innerHTML = '<p style="color: #64748b; font-size: 13px; margin:0; background: #f1f5f9; padding: 10px; border-radius: 6px;">ℹ️ Belum ada riwayat pesanan yang tersimpan di perangkat ini.</p>';
        return;
    }

    const found = riwayat.filter(o => o.orderId.toLowerCase().includes(keyword.toLowerCase()) || o.phone.includes(keyword));

    if (found.length > 0) {
        let html = '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">';
        found.forEach(o => {
            html += `<p style="margin:4px 0;"><b>ID:</b> ${o.orderId} | <b>Nama:</b> ${o.nama} | <b>Status:</b> <span style="color:#d97706; font-weight:bold;">${o.status}</span></p>`;
            let copy = o.jumlahCopy ? `${o.jumlahCopy} Rangkap` : '';
            let kertas = o.ukuranKertas ? `- ${o.ukuranKertas}` : '';
            html += `<p style="margin:4px 0; color:#64748b;">Detail: ${o.jumlahHalaman} Hal ${copy} (${o.jenisCetak} ${kertas}) - Total: Rp ${o.totalHarga.toLocaleString('id-ID')}</p><hr style="border:0; border-top:1px solid #eee; margin:8px 0;">`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0; background: #fee2e2; padding: 10px; border-radius: 6px;">❌ Pesanan tidak ditemukan. Periksa kembali ID Invoice atau Nomor WhatsApp Anda.</p>';
    }
}