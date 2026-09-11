// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdXRmY3NoaGdwcHlnaXB4emZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjQxNDMsImV4cCI6MjEwNDcwMDE0M30.vhd6pH6jkNsbnnZsjgonc8xGc7yk-rQIZSgegiXbmBs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_WA = "6285316121981";

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

window.addEventListener('DOMContentLoaded', () => {
    checkLiveStoreStatus();
    generateJadwalAmbil();
});

// --- FORM HANDLER & PRICING ---
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
const jumlahHalamanInput = document.getElementById('jumlahHalaman');

function handleKategoriChange() {
    if (!kategoriLayanan) return;
    if (kategoriLayanan.value === 'stiker') {
        sectionDokumen.style.display = 'none';
        sectionStiker.style.display = 'block';
        if (fileLabel) fileLabel.innerText = "Upload File Desain Stiker (PNG/JPG/CDR/PDF) *";
        if (fileHelper) fileHelper.innerHTML = "💡 <b>Tips Stiker:</b> Gunakan file resolusi tinggi (PNG transparan/CDR/PDF). Maksimal 10MB.";
    } else {
        sectionDokumen.style.display = 'block';
        sectionStiker.style.display = 'none';
        if (fileLabel) fileLabel.innerText = "Upload File Dokumen (PDF/DOCX) *";
        if (fileHelper) fileHelper.innerHTML = "Format: PDF (Auto-deteksi halaman), DOCX. Maksimal 10MB.";
    }
    updatePrice();
}

if (kategoriLayanan) kategoriLayanan.addEventListener('change', handleKategoriChange);

if (ukuranKertasSelect) {
    ukuranKertasSelect.addEventListener('change', () => {
        groupCustomUkuran.style.display = ukuranKertasSelect.value === 'Custom' ? 'block' : 'none';
        updatePrice();
    });
}

if (jenisStikerSelect) {
    jenisStikerSelect.addEventListener('change', () => {
        const labelJumlah = document.getElementById('labelJumlahStiker');
        if (labelJumlah) {
            labelJumlah.innerText = jenisStikerSelect.value === 'Roll' ? "Panjang Stiker (dalam Meter) *" : "Jumlah Lembar A3+ *";
        }
        updatePrice();
    });
}

// --- DETEKSI HALAMAN PDF ---
if (fileInput) {
    fileInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            fileHelper.innerHTML = `❌ <span style="color: #dc2626;">File terlalu besar! Maksimal 10MB.</span>`;
            this.value = '';
            return;
        }

        if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                if (jumlahHalamanInput) {
                    jumlahHalamanInput.value = pdf.numPages;
                    updatePrice();
                }
                fileHelper.innerHTML = `✅ <span style="color: #16a34a; font-weight: bold;">PDF Valid (${pdf.numPages} Halaman)</span>`;
            } catch (err) {
                fileHelper.innerHTML = `✅ <span style="color: #16a34a; font-weight: bold;">File Siap Diupload</span>`;
            }
        } else {
            fileHelper.innerHTML = `✅ <span style="color: #16a34a; font-weight: bold;">File Siap Diupload</span>`;
        }
    });
}

const jumlahCopyInput = document.getElementById('jumlahCopy');
const pricePreview = document.getElementById('pricePreview');

function updatePrice() {
    const kategori = kategoriLayanan ? kategoriLayanan.value : 'dokumen';
    let total = 0;

    if (kategori === 'stiker') {
        const jenisStiker = jenisStikerSelect ? jenisStikerSelect.value : 'Vinyl';
        const jumlah = parseInt(jumlahLembarStikerInput ? jumlahLembarStikerInput.value : 1) || 1;
        let hargaSatuan = jenisStiker === 'Kromo' ? 15000 : (jenisStiker === 'Roll' ? 50000 : 25000);
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
    
    if(pricePreview) pricePreview.innerText = "Rp " + total.toLocaleString('id-ID');
}

if (jumlahHalamanInput) jumlahHalamanInput.addEventListener('input', updatePrice);
if (jumlahCopyInput) jumlahCopyInput.addEventListener('input', updatePrice);
if (jumlahLembarStikerInput) jumlahLembarStikerInput.addEventListener('input', updatePrice);

// --- TIMER INVOICE ---
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
            if (timerDisplay) timerDisplay.innerText = "⏱️ Waktu Habis!";
        }
    }, 1000);
}

// --- SUBMIT FORM & UPLOAD KE SUPABASE ---
let tempOrderData = null;
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            alert('❌ Harap upload file terlebih dahulu!');
            return;
        }

        const nama = document.getElementById('nama').value;
        const phone = document.getElementById('phone').value.trim();
        const waktuAmbil = document.getElementById('waktuAmbil').value;
        const kategori = kategoriLayanan.value;
        const catatan = document.getElementById('catatan').value || '-';

        let detailText = '';
        let totalHarga = 0;

        if (kategori === 'stiker') {
            const jenisStiker = jenisStikerSelect.value;
            const jumlah = document.getElementById('jumlahLembarStiker').value;
            const finishing = document.getElementById('finishingStiker').value;
            let hargaSatuan = jenisStiker === 'Kromo' ? 15000 : (jenisStiker === 'Roll' ? 50000 : 25000);
            totalHarga = jumlah * hargaSatuan;
            detailText = `Stiker ${jenisStiker} - ${jumlah} ${jenisStiker === 'Roll' ? 'Meter' : 'Lembar A3+'} (${finishing})`;
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
        }

        tempOrderData = {
            nama, phone, waktuAmbil, kategori, detailText, catatan, file, totalHarga
        };

        document.getElementById('mNama').innerText = nama;
        document.getElementById('mPhone').innerText = phone;
        document.getElementById('mAmbil').innerText = waktuAmbil;
        document.getElementById('mDetail').innerText = detailText;
        document.getElementById('mTotal').innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');

        document.getElementById('confirmModal').style.display = 'flex';
    });
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

const btnProceedInvoice = document.getElementById('btnProceedInvoice');
if (btnProceedInvoice) {
    btnProceedInvoice.onclick = async function() {
        if (!tempOrderData) return;

        btnProceedInvoice.disabled = true;
        btnProceedInvoice.innerText = "⏳ Mengunggah...";

        try {
            // 1. CEK JUMLAH PESANAN SAAT INI UNTUK ANTREAN (KHN-001, KHN-002, dst)
            const { count, error: countError } = await supabaseClient
                .from('orders')
                .select('*', { count: 'exact', head: true });

            let nextNumber = (count || 0) + 1;
            const formattedNumber = String(nextNumber).padStart(3, '0');
            const noAntrian = `KHN-${formattedNumber}`;

            // 2. Upload file ke Supabase Storage
            const file = tempOrderData.file;
            const fileExt = file.name.split('.').pop();
            const fileNameCloud = `${Date.now()}_${tempOrderData.phone}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('kohan-files')
                .upload(fileNameCloud, file);

            if (uploadError) throw uploadError;

            // 3. Dapatkan Public URL File
            const { data: urlData } = supabaseClient
                .storage
                .from('kohan-files')
                .getPublicUrl(fileNameCloud);

            const filePublicUrl = urlData.publicUrl;

            // 4. Simpan data ke Database Supabase
            const { error: dbError } = await supabaseClient
                .from('orders')
                .insert([
                    {
                        no_antrian: noAntrian,
                        nama: tempOrderData.nama,
                        phone: tempOrderData.phone,
                        kategori: tempOrderData.kategori,
                        detail_cetak: tempOrderData.detailText,
                        catatan: tempOrderData.catatan,
                        waktu_ambil: tempOrderData.waktuAmbil,
                        total_harga: tempOrderData.totalHarga,
                        status: 'Menunggu Pembayaran (UNPAID)',
                        file_url: filePublicUrl,
                        file_name: file.name
                    }
                ]);

            if (dbError) throw dbError;

            // Render ke invoice
            document.getElementById('invPhone').innerText = tempOrderData.phone;
            document.getElementById('invNama').innerText = tempOrderData.nama;
            document.getElementById('invDetail').innerText = `[NO ANTREAN: ${noAntrian}]\n${tempOrderData.detailText}\nFile: ${file.name}\nAmbil: ${tempOrderData.waktuAmbil}`;
            document.getElementById('invTotal').innerText = 'Rp ' + tempOrderData.totalHarga.toLocaleString('id-ID');

            const pesanWA = `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*No Antrean:* ${noAntrian}\n*No WA:* ${tempOrderData.phone}\n*Nama:* ${tempOrderData.nama}\n*Waktu Ambil:* ${tempOrderData.waktuAmbil}\n*Detail:* ${tempOrderData.detailText}\n*Catatan:* ${tempOrderData.catatan}\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;
            document.getElementById('btnInvWA').href = `https://wa.me/${ADMIN_WA}?text=` + encodeURIComponent(pesanWA);

            closeConfirmModal();
            const navInvoice = document.getElementById('nav-invoice');
            if (navInvoice) navInvoice.style.display = 'block';

            if(typeof window.switchPage === 'function') window.switchPage('invoice');
            
            startInvoiceTimer(600);
            orderForm.reset();
            handleKategoriChange();
            updatePrice();
            generateJadwalAmbil();

        } catch (err) {
            alert('❌ Gagal menyimpan pesanan: ' + err.message);
        } finally {
            btnProceedInvoice.disabled = false;
            btnProceedInvoice.innerText = "Lanjutkan 🚀";
        }
    };
}

// --- LACAK PESANAN REALTIME DARI SUPABASE ---
async function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    resultDiv.style.display = 'block';

    if (!keyword) {
        resultDiv.innerHTML = '<p style="color: #d97706; font-size: 13px; margin:0; background: #fef3c7; padding: 10px; border-radius: 6px;">⚠️ Masukkan Nomor WhatsApp Anda.</p>';
        return;
    }

    resultDiv.innerHTML = '<p style="color: #64748b; font-size: 13px; margin:0;">⏳ Mencari pesanan...</p>';

    const { data: found, error } = await supabaseClient
        .from('orders')
        .select('*')
        .ilike('phone', `%${keyword}%`)
        .order('id', { ascending: false });

    if (error) {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0;">❌ Gagal memuat data dari database.</p>';
        return;
    }

    if (found && found.length > 0) {
        let html = '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; color:#1e293b;">';
        found.forEach(o => {
            let maskedPhone = o.phone.length > 4 ? o.phone.slice(0, -4) + 'XXXX' : 'XXXX';
            let badgeBg = o.status.includes('UNPAID') ? '#fef3c7' : (o.status.includes('SIAP') ? '#dcfce7' : '#e0f2fe');
            let badgeColor = o.status.includes('UNPAID') ? '#d97706' : (o.status.includes('SIAP') ? '#16a34a' : '#0284c7');

            html += `
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                    <p style="margin: 2px 0;"><b>No Antrean:</b> <span style="color:#2563eb; font-weight:bold;">${o.no_antrian || '-'}</span></p>
                    <p style="margin: 2px 0;"><b>Pemesan:</b> ${o.nama} (${maskedPhone})</p>
                    <p style="margin: 2px 0;"><b>Status:</b> <span style="color:${badgeColor}; font-weight:bold; background:${badgeBg}; padding: 2px 8px; border-radius: 4px; display:inline-block;">${o.status}</span></p>
                    <p style="margin: 2px 0; color:#64748b;"><b>Detail:</b> ${o.detail_cetak}</p>
                    <p style="margin: 2px 0; color:#64748b;"><b>Ambil:</b> ${o.waktu_ambil}</p>
                    <p style="margin: 2px 0; font-size: 14px;"><b>Total:</b> <span style="color: #2563eb; font-weight: bold;">Rp ${Number(o.total_harga).toLocaleString('id-ID')}</span></p>
                </div>
            `;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0; background: #fee2e2; padding: 10px; border-radius: 6px;">❌ Tidak ada riwayat pesanan dengan Nomor WhatsApp tersebut.</p>';
    }
}