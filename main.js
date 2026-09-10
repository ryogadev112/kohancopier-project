const ADMIN_WA = "6285316121981";

// --- RENDER DAFTAR RIWAYAT PESANAN SAYA ---
function renderOrderHistory() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];

    if (riwayat.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                <p style="font-size: 15px; margin: 0 0 8px 0;">ℹ️ Belum ada riwayat pesanan.</p>
                <p style="font-size: 13px; margin: 0;">Yuk buat pesanan pertamamu sekarang!</p>
                <button onclick="switchPage('order')" class="btn-primary" style="margin-top: 16px; padding: 10px 20px; font-size: 14px;">Mulai Pesan 🚀</button>
            </div>
        `;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
    riwayat.slice().reverse().forEach(o => {
        let desc = o.kategori === 'stiker' 
            ? `Stiker ${o.jenisStiker} - ${o.jumlahLembar} ${o.jenisStiker === 'Roll' ? 'Meter' : 'Lbr A3+'} (${o.finishing})`
            : `${o.jumlahHalaman} Hal x ${o.jumlahCopy} Rangkap (${o.jenisCetak} - ${o.ukuranKertas || 'A4'})`;

        html += `
            <div style="background: var(--box-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                    <div>
                        <span style="font-weight: 700; color: var(--primary);">${o.orderId}</span>
                        <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">${o.tanggal || ''}</span>
                    </div>
                    <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; background: #fef3c7; color: #d97706;">${o.status || 'UNPAID'}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-main); line-height: 1.5;">
                    <p style="margin: 2px 0;"><b>Pemesan:</b> ${o.nama} (${o.phone})</p>
                    <p style="margin: 2px 0;"><b>Detail:</b> ${desc}</p>
                    <p style="margin: 2px 0;"><b>Ambil:</b> ${o.waktuAmbil || 'Secepatnya'}</p>
                    <p style="margin: 2px 0; font-size: 14px; margin-top: 6px;"><b>Total:</b> <span style="color: var(--primary); font-weight: bold;">Rp ${o.totalHarga.toLocaleString('id-ID')}</span></p>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                    <a href="https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(`Halo Admin KohanCopier, saya ingin konfirmasi pesanan ID: ${o.orderId} atas nama ${o.nama}`)}" target="_blank" style="flex: 1; text-align: center; background: #22c55e; color: white; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: bold; text-decoration: none;">📱 Hubungi WA Admin</a>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// --- CEK STATUS TOKO LIVE ---
function checkLiveStoreStatus() {
    const badge = document.getElementById('liveStoreBadge');
    if (!badge) return;

    const now = new Date();
    const day = now.getDay();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const jamBukaToko = {
        0: { buka: 0, tutup: 0, libur: true },
        1: { buka: 6, tutup: 17, libur: false },
        2: { buka: 9, tutup: 18, libur: false },
        3: { buka: 9, tutup: 18, libur: false },
        4: { buka: 6, tutup: 17, libur: false },
        5: { buka: 6, tutup: 17, libur: false },
        6: { buka: 7, tutup: 12, libur: false }
    };

    const hariIni = jamBukaToko[day];
    let isOpen = false;

    if (!hariIni.libur && currentHour >= hariIni.buka && currentHour < hariIni.tutup) {
        isOpen = true;
    }

    if (isOpen) {
        badge.className = "store-badge open";
        badge.innerHTML = "🟢 Toko Buka";
    } else {
        badge.className = "store-badge closed";
        badge.innerHTML = "🔴 Toko Tutup";
    }
}

// --- GENERATE SLOT WAKTU AMBIL ---
function generateJadwalAmbil() {
    const selectAmbil = document.getElementById('waktuAmbil');
    const infoJamBuka = document.getElementById('infoJamBuka');
    if (!selectAmbil) return;

    selectAmbil.innerHTML = '';

    const now = new Date();
    const day = now.getDay();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const jamBukaToko = {
        0: { nama: 'Minggu', buka: 0, tutup: 0, libur: true },
        1: { nama: 'Senin', buka: 6, tutup: 17, libur: false },
        2: { nama: 'Selasa', buka: 9, tutup: 18, libur: false },
        3: { nama: 'Rabu', buka: 9, tutup: 18, libur: false },
        4: { nama: 'Kamis', buka: 6, tutup: 17, libur: false },
        5: { nama: 'Jumat', buka: 6, tutup: 17, libur: false },
        6: { nama: 'Sabtu', buka: 7, tutup: 12, libur: false }
    };

    const hariIni = jamBukaToko[day];
    let optionsHtml = '';

    if (hariIni.libur || currentHour >= hariIni.tutup) {
        if (infoJamBuka) infoJamBuka.innerText = `⚠️ Toko ${hariIni.libur ? 'libur (Minggu)' : 'sudah tutup hari ini'}. Pesanan akan disiapkan untuk hari berikutnya.`;
        optionsHtml += `<option value="Besok (Hari Buka) - Jam Operasional">Besok (Sesuai Jam Buka Toko)</option>`;
    } else {
        if (infoJamBuka) infoJamBuka.innerText = `ℹ️ Jam Operasional Hari Ini (${hariIni.nama}): ${String(hariIni.buka).padStart(2,'0')}.00 – ${String(hariIni.tutup).padStart(2,'0')}.00 WIB`;
        
        optionsHtml += `<option value="Hari ini - Secepatnya (Sesuai Antrean)">Hari ini - Secepatnya (Sesuai Antrean)</option>`;
        
        if (hariIni.tutup > 12 && currentHour < 12) {
            optionsHtml += `<option value="Hari ini - Siang (12:00 - 15:00)">Hari ini - Siang (12:00 - 15:00)</option>`;
        }
        if (hariIni.tutup > 15 && currentHour < 15) {
            optionsHtml += `<option value="Hari ini - Sore (15:00 - ${String(hariIni.tutup).padStart(2,'0')}:00)">Hari ini - Sore (15:00 - ${String(hariIni.tutup).padStart(2,'0')}:00)</option>`;
        }
        optionsHtml += `<option value="Besok Pagi">Besok Pagi</option>`;
    }

    selectAmbil.innerHTML = optionsHtml;
}

// --- INIT EVENT LISTENERS ---
window.addEventListener('DOMContentLoaded', () => {
    checkLiveStoreStatus();
    generateJadwalAmbil();

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    if(riwayat.length > 0) {
        let lastOrder = riwayat[riwayat.length - 1];
        const inputNama = document.getElementById('nama');
        const inputPhone = document.getElementById('phone');
        if (inputNama) inputNama.value = lastOrder.nama || '';
        if (inputPhone) inputPhone.value = lastOrder.phone || '';
    }
});

// --- TOGGLE TAMPILAN FORM (DOKUMEN VS STIKER) & PANDUAN FILE ---
const kategoriLayanan = document.getElementById('kategoriLayanan');
const sectionDokumen = document.getElementById('sectionDokumen');
const sectionStiker = document.getElementById('sectionStiker');
const fileLabel = document.getElementById('fileLabel');
const fileHelper = document.getElementById('fileHelper');
const fileInput = document.getElementById('file');
const jenisStikerSelect = document.getElementById('jenisStiker');
const jumlahLembarStikerInput = document.getElementById('jumlahLembarStiker');
const ukuranKertasSelect = document.getElementById('ukuranKertas');
const groupCustomUkuran = document.getElementById('groupCustomUkuran');

function handleKategoriChange() {
    if (!kategoriLayanan) return;
    if (kategoriLayanan.value === 'stiker') {
        sectionDokumen.style.display = 'none';
        sectionStiker.style.display = 'block';
        if (fileLabel) fileLabel.innerText = "Upload File Desain Stiker (PNG/JPG/CDR/PDF) *";
        if (fileHelper) fileHelper.innerHTML = "💡 <b>Tips Stiker:</b> Gunakan file resolusi tinggi (PNG transparan atau CDR/PDF) agar hasil potong tajam. Maksimal 10MB.";
    } else {
        sectionDokumen.style.display = 'block';
        sectionStiker.style.display = 'none';
        if (fileLabel) fileLabel.innerText = "Upload File Dokumen (PDF/DOCX) *";
        if (fileHelper) fileHelper.innerHTML = "Format: PDF atau DOCX. Maksimal 10MB.";
    }
    updatePrice();
}

if (kategoriLayanan) {
    kategoriLayanan.addEventListener('change', handleKategoriChange);
}

// --- TOGGLE INPUT CUSTOM UKURAN KERTAS ---
function handleUkuranKertasChange() {
    if (!ukuranKertasSelect || !groupCustomUkuran) return;
    if (ukuranKertasSelect.value === 'Custom') {
        groupCustomUkuran.style.display = 'block';
    } else {
        groupCustomUkuran.style.display = 'none';
    }
    updatePrice();
}

if (ukuranKertasSelect) {
    ukuranKertasSelect.addEventListener('change', handleUkuranKertasChange);
}

// --- UPDATE LABEL JUMLAH STIKER (A3+ VS ROLL) ---
function handleJenisStikerChange() {
    const jenisStiker = jenisStikerSelect ? jenisStikerSelect.value : 'Vinyl';
    const labelJumlah = document.getElementById('labelJumlahStiker');
    
    if (labelJumlah) {
        if (jenisStiker === 'Roll') {
            labelJumlah.innerText = "Panjang Stiker (dalam Meter) *";
        } else {
            labelJumlah.innerText = "Jumlah Lembar A3+ *";
        }
    }
    updatePrice();
}

if (jenisStikerSelect) {
    jenisStikerSelect.addEventListener('change', handleJenisStikerChange);
}

// --- VALIDASI FILE INSTAN (LIVE CHECK) ---
if (fileInput) {
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        
        if (file.size > 10 * 1024 * 1024) {
            fileHelper.innerHTML = `❌ <span style="color: #dc2626;">File terlalu besar (${fileSizeMB} MB)! Maksimal ukuran file adalah 10MB.</span>`;
            this.value = '';
            return;
        }

        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
        const isAllowed = allowedTypes.includes(file.type) || file.name.match(/\.(pdf|docx|png|jpg|jpeg|cdr)$/i);

        if (!isAllowed) {
            fileHelper.innerHTML = `❌ <span style="color: #dc2626;">Format file tidak didukung! Upload file PDF, DOCX, PNG, JPG, atau CDR.</span>`;
            this.value = '';
            return;
        }

        fileHelper.innerHTML = `✅ <span style="color: #16a34a; font-weight: bold;">File valid (${file.name} - ${fileSizeMB} MB) siap diproses!</span>`;
    });
}

// --- KALKULASI HARGA REAL-TIME ---
const jumlahHalamanInput = document.getElementById('jumlahHalaman');
const jumlahCopyInput = document.getElementById('jumlahCopy');
const radiosCetak = document.querySelectorAll('input[name="jenisCetak"]');
const pricePreview = document.getElementById('pricePreview');

function updatePrice() {
    const kategori = kategoriLayanan ? kategoriLayanan.value : 'dokumen';
    let total = 0;

    if (kategori === 'stiker') {
        const jenisStiker = jenisStikerSelect ? jenisStikerSelect.value : 'Vinyl';
        const jumlah = parseInt(jumlahLembarStikerInput ? jumlahLembarStikerInput.value : 1) || 1;
        
        let hargaSatuan = 25000;
        if (jenisStiker === 'Kromo') hargaSatuan = 15000;
        if (jenisStiker === 'Roll') hargaSatuan = 50000;

        total = jumlah * hargaSatuan;
    } else {
        const hal = parseInt(jumlahHalamanInput ? jumlahHalamanInput.value : 1) || 1;
        const copy = parseInt(jumlahCopyInput ? jumlahCopyInput.value : 1) || 1;
        const checkedRadio = document.querySelector('input[name="jenisCetak"]:checked');
        const jenis = checkedRadio ? checkedRadio.value : 'Hitam Putih';
        const ukuranKertas = ukuranKertasSelect ? ukuranKertasSelect.value : 'A4';
        
        let hargaPerHal = jenis === 'Warna' ? 2000 : 1000;
        if (ukuranKertas === 'A3+') hargaPerHal *= 2;

        total = hal * copy * hargaPerHal;
    }
    
    if(pricePreview) {
        pricePreview.innerText = "Rp " + total.toLocaleString('id-ID');
    }
}

if (jumlahHalamanInput) jumlahHalamanInput.addEventListener('input', updatePrice);
if (jumlahCopyInput) jumlahCopyInput.addEventListener('input', updatePrice);
radiosCetak.forEach(radio => radio.addEventListener('change', updatePrice));
if (ukuranKertasSelect) ukuranKertasSelect.addEventListener('change', updatePrice);
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

        if (!file) {
            alert('❌ Harap upload file terlebih dahulu!');
            return;
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
                const jenisStiker = jenisStikerSelect.value;
                const jumlah = document.getElementById('jumlahLembarStiker').value;
                const finishing = document.getElementById('finishingStiker').value;
                
                let hargaSatuan = 25000;
                if (jenisStiker === 'Kromo') hargaSatuan = 15000;
                if (jenisStiker === 'Roll') hargaSatuan = 50000;
                totalHarga = jumlah * hargaSatuan;

                detailText = `Stiker ${jenisStiker} - ${jumlah} ${jenisStiker === 'Roll' ? 'Meter' : 'Lembar A3+'} (${finishing})`;
                tempOrderData = {
                    orderId, nama, phone, waktuAmbil, kategori, jenisStiker, jumlahLembar: jumlah, finishing, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
                };
            } else {
                const jumlahHalaman = document.getElementById('jumlahHalaman').value;
                const jumlahCopy = document.getElementById('jumlahCopy').value;
                const jenisCetak = document.querySelector('input[name="jenisCetak"]:checked').value;
                
                const ukuranKertasBase = ukuranKertasSelect.value;
                const customUkuranText = document.getElementById('detailCustomUkuran').value || 'Custom';
                const ukuranKertas = ukuranKertasBase === 'Custom' ? `Custom (${customUkuranText})` : ukuranKertasBase;
                
                let hargaPerHal = jenisCetak === 'Warna' ? 2000 : 1000;
                if (ukuranKertasBase === 'A3+') hargaPerHal *= 2;
                
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
            ? `Stiker ${tempOrderData.jenisStiker} - ${tempOrderData.jumlahLembar} ${tempOrderData.jenisStiker === 'Roll' ? 'Meter' : 'Lembar A3+'} (${tempOrderData.finishing})`
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
        generateJadwalAmbil();
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
                ? `Stiker ${o.jenisStiker} - ${o.jumlahLembar} ${o.jenisStiker === 'Roll' ? 'Meter' : 'Lembar A3+'} (${o.finishing})`
                : `${o.jumlahHalaman} Hal ${o.jumlahCopy ? 'x ' + o.jumlahCopy + ' Rangkap' : ''} (${o.jenisCetak} - ${o.ukuranKertas || 'A4'})`;
            
            let jadwalAmbil = o.waktuAmbil || 'Secepatnya';
            html += `<p style="margin:4px 0; color:#64748b;">Detail: ${desc}<br>Ambil: <b>${jadwalAmbil}</b><br>Total: Rp ${o.totalHarga.toLocaleString('id-ID')}</p><hr style="border:0; border-top:1px solid #eee; margin:8px 0;">`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0; background: #fee2e2; padding: 10px; border-radius: 6px;">❌ Pesanan tidak ditemukan. Periksa kembali ID Invoice atau Nomor WhatsApp Anda.</p>';
    }
}