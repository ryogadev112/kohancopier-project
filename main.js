const ADMIN_WA = "6285316121981";

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

// --- TOGGLE TAMPILAN FORM (DOKUMEN VS STIKER) ---
const kategoriLayanan = document.getElementById('kategoriLayanan');
const sectionDokumen = document.getElementById('sectionDokumen');
const sectionStiker = document.getElementById('sectionStiker');

function handleKategoriChange() {
    if (!kategoriLayanan) return;
    if (kategoriLayanan.value === 'stiker') {
        sectionDokumen.style.display = 'none';
        sectionStiker.style.display = 'block';
    } else {
        sectionDokumen.style.display = 'block';
        sectionStiker.style.display = 'none';
    }
    updatePrice();
}

if (kategoriLayanan) {
    kategoriLayanan.addEventListener('change', handleKategoriChange);
}

// --- KALKULASI HARGA REAL-TIME ---
const jumlahHalamanInput = document.getElementById('jumlahHalaman');
const jumlahCopyInput = document.getElementById('jumlahCopy');
const radiosCetak = document.querySelectorAll('input[name="jenisCetak"]');
const ukuranKertasSelect = document.getElementById('ukuranKertas');
const jenisStikerSelect = document.getElementById('jenisStiker');
const jumlahLembarStikerInput = document.getElementById('jumlahLembarStiker');
const pricePreview = document.getElementById('pricePreview');

function updatePrice() {
    const kategori = kategoriLayanan ? kategoriLayanan.value : 'dokumen';
    let total = 0;

    if (kategori === 'stiker') {
        const jenisStiker = jenisStikerSelect ? jenisStikerSelect.value : 'Vinyl';
        const lembar = parseInt(jumlahLembarStikerInput ? jumlahLembarStikerInput.value : 1) || 1;
        
        // Harga stiker: Vinyl Rp 25.000, Kromo Rp 15.000 per lembar A3+
        const hargaPerLembar = jenisStiker === 'Vinyl' ? 25000 : 15000;
        total = lembar * hargaPerLembar;
    } else {
        const hal = parseInt(jumlahHalamanInput ? jumlahHalamanInput.value : 1) || 1;
        const copy = parseInt(jumlahCopyInput ? jumlahCopyInput.value : 1) || 1;
        const checkedRadio = document.querySelector('input[name="jenisCetak"]:checked');
        const jenis = checkedRadio ? checkedRadio.value : 'Hitam Putih';
        const ukuranKertas = ukuranKertasSelect ? ukuranKertasSelect.value : 'A4';
        
        let hargaPerHal = jenis === 'Warna' ? 2000 : 1000;
        
        // Jika ukuran A3+, harga dikalikan 2
        if (ukuranKertas === 'A3+') {
            hargaPerHal *= 2;
        }

        total = hal * copy * hargaPerHal;
    }
    
    if(pricePreview) {
        pricePreview.innerText = "Rp " + total.toLocaleString('id-ID');
    }
}

// Event Listeners untuk kalkulasi harga
if (jumlahHalamanInput) jumlahHalamanInput.addEventListener('input', updatePrice);
if (jumlahCopyInput) jumlahCopyInput.addEventListener('input', updatePrice);
radiosCetak.forEach(radio => radio.addEventListener('change', updatePrice));
if (ukuranKertasSelect) ukuranKertasSelect.addEventListener('change', updatePrice);
if (jenisStikerSelect) jenisStikerSelect.addEventListener('change', updatePrice);
if (jumlahLembarStikerInput) jumlahLembarStikerInput.addEventListener('input', updatePrice);

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

// --- SUBMIT FORM & VALIDASI ---
let tempOrderData = null;
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (file) {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|png|jpg|jpeg|cdr)$/i)) {
                alert('❌ Format file tidak didukung! Harap upload file PDF, DOCX, atau Gambar/Desain.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('❌ Ukuran file terlalu besar! Maksimal 10MB.');
                return;
            }
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Memproses Pesanan...</span>`;

        setTimeout(() => {
            const nama = document.getElementById('nama').value;
            const phone = document.getElementById('phone').value;
            const waktuAmbil = document.getElementById('waktuAmbil').value;
            const kategori = kategoriLayanan.value;
            const catatan = document.getElementById('catatan').value || '-';
            const fileName = file ? file.name : 'Tidak ada file';
            const orderId = 'KC-' + Math.floor(1000000000 + Math.random() * 9000000000);

            let detailText = '';
            let totalHarga = 0;

            if (kategori === 'stiker') {
                const jenisStiker = document.getElementById('jenisStiker').value;
                const jumlahLembar = document.getElementById('jumlahLembarStiker').value;
                const finishing = document.getElementById('finishingStiker').value;
                const hargaPerLembar = jenisStiker === 'Vinyl' ? 25000 : 15000;
                totalHarga = jumlahLembar * hargaPerLembar;

                detailText = `Stiker ${jenisStiker} - ${jumlahLembar} Lembar A3+ (${finishing})`;
                tempOrderData = {
                    orderId, nama, phone, waktuAmbil, kategori, jenisStiker, jumlahLembar, finishing, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
                };
            } else {
                const jumlahHalaman = document.getElementById('jumlahHalaman').value;
                const jumlahCopy = document.getElementById('jumlahCopy').value;
                const jenisCetak = document.querySelector('input[name="jenisCetak"]:checked').value;
                const ukuranKertas = document.getElementById('ukuranKertas').value;
                
                let hargaPerHal = jenisCetak === 'Warna' ? 2000 : 1000;
                if (ukuranKertas === 'A3+') hargaPerHal *= 2;
                
                totalHarga = jumlahHalaman * jumlahCopy * hargaPerHal;

                detailText = `${jumlahHalaman} Hal x ${jumlahCopy} Rangkap (${jenisCetak} - ${ukuranKertas})`;
                tempOrderData = {
                    orderId, nama, phone, waktuAmbil, kategori, jumlahHalaman, jumlahCopy, jenisCetak, ukuranKertas, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
                };
            }

            document.getElementById('mNama').innerText = nama;
            document.getElementById('mPhone').innerText = phone;
            document.getElementById('mAmbil').innerText = waktuAmbil;
            document.getElementById('mDetail').innerText = detailText;
            document.getElementById('mTotal').innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');

            document.getElementById('confirmModal').style.display = 'flex';

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }, 500);
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
        
        let detailInv = tempOrderData.kategori === 'stiker' 
            ? `Stiker ${tempOrderData.jenisStiker} - ${tempOrderData.jumlahLembar} Lembar A3+ (${tempOrderData.finishing})`
            : `${tempOrderData.jumlahHalaman} Hal x ${tempOrderData.jumlahCopy} Rangkap (${tempOrderData.jenisCetak} - ${tempOrderData.ukuranKertas})`;

        document.getElementById('invDetail').innerText = `${detailInv}\nFile: ${tempOrderData.fileName}\nAmbil: ${tempOrderData.waktuAmbil}`;
        document.getElementById('invTotal').innerText = 'Rp ' + tempOrderData.totalHarga.toLocaleString('id-ID');

        const pesanWA = `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*ID Invoice:* ${tempOrderData.orderId}\n*Nama:* ${tempOrderData.nama}\n*Waktu Ambil:* ${tempOrderData.waktuAmbil}\n*Detail:* ${detailInv}\n*Catatan:* ${tempOrderData.catatan}\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;
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
        handleKategoriChange();
        updatePrice();
    };
}

// --- LACAK PESANAN ---
function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    resultDiv.style.display = 'block';

    if (!keyword) {
        resultDiv.innerHTML = '<p style="color: #d97706; font-size: 13px; margin:0; background: #fef3c7; padding: 10px; border-radius: 6px;">⚠️ Masukkan ID Pesanan (contoh: KC-123456) atau Nomor WhatsApp yang digunakan saat memesan.</p>';
        return;
    }

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    
    if (riwayat.length === 0) {
        resultDiv.innerHTML = '<p style="color: #64748b; font-size: 13px; margin:0; background: #f1f5f9; padding: 10px; border-radius: 6px;">ℹ️ Belum ada riwayat pesanan yang tersimpan di perangkat ini.</p>';
        return;
    }

    const found = riwayat.filter(o => o.orderId.toLowerCase().includes(keyword.toLowerCase()) || o.phone.includes(keyword));

    if (found.length > 0) {
        let html = '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">';
        found.forEach(o => {
            html += `<p style="margin:4px 0;"><b>ID:</b> ${o.orderId} | <b>Nama:</b> ${o.nama} | <b>Status:</b> <span style="color:#d97706; font-weight:bold;">${o.status}</span></p>`;
            let desc = o.kategori === 'stiker' 
                ? `Stiker ${o.jenisStiker} - ${o.jumlahLembar} Lembar A3+ (${o.finishing})`
                : `${o.jumlahHalaman} Hal ${o.jumlahCopy ? 'x ' + o.jumlahCopy + ' Rangkap' : ''} (${o.jenisCetak} - ${o.ukuranKertas || 'A4'})`;
            
            // Tambahkan jadwal ambil ke hasil pelacakan
            let jadwalAmbil = o.waktuAmbil || 'Secepatnya';
            html += `<p style="margin:4px 0; color:#64748b;">Detail: ${desc}<br>Ambil: <b>${jadwalAmbil}</b><br>Total: Rp ${o.totalHarga.toLocaleString('id-ID')}</p><hr style="border:0; border-top:1px solid #eee; margin:8px 0;">`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0; background: #fee2e2; padding: 10px; border-radius: 6px;">❌ Pesanan tidak ditemukan. Periksa kembali ID Invoice atau Nomor WhatsApp Anda.</p>';
    }
}