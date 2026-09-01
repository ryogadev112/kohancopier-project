const NOMOR_WA_ADMIN = "6288218475220";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6hlU7FtCH4-NDlKUkew1NjeBoaui3aR0UhYHDnzfUyTKYyhn45q4xPIpC4AuXm-lxIg/exec";

// 1. Kalkulator Estimasi Biaya
function hitungTotalBiaya() {
    const elJumlah = document.getElementById('jumlahHalaman');
    const elJenis = document.getElementById('jenisCetak');
    const previewEl = document.getElementById('pricePreview');

    if (!elJumlah || !elJenis || !previewEl) return { total: 1000, formatted: 'Rp 1.000' };

    const jumlahHalaman = parseInt(elJumlah.value) || 1;
    const jenisCetak = elJenis.value || 'Hitam Putih';
    
    const hargaPerHal = (jenisCetak === 'Warna') ? 2000 : 1000;
    const total = jumlahHalaman * hargaPerHal;
    const formatted = 'Rp ' + total.toLocaleString('id-ID');

    previewEl.innerText = formatted;

    return { total, formatted };
}

function initCalculator() {
    const elJumlah = document.getElementById('jumlahHalaman');
    const elJenis = document.getElementById('jenisCetak');

    if (elJumlah) {
        elJumlah.addEventListener('input', hitungTotalBiaya);
        elJumlah.addEventListener('change', hitungTotalBiaya);
    }
    if (elJenis) {
        elJenis.addEventListener('change', hitungTotalBiaya);
    }
    
    hitungTotalBiaya();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}

// 2. Lacak Status Antrian, Estimasi Selesai (Jam Live), & Status Selesai
async function lacakStatusPesanan() {
    const inputVal = document.getElementById('trackInput')?.value.trim();
    const trackResultEl = document.getElementById('trackResult');

    if (!inputVal) {
        alert("Masukkan ID Pesanan atau Nomor WhatsApp!");
        return;
    }

    if (!trackResultEl) return;

    trackResultEl.style.display = 'block';
    trackResultEl.innerHTML = '<p style="font-size:13px; color:#64748b;">Mengecek status pesanan...</p>';

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
        const data = await res.json();
        
        const pendingOrders = data.orders || [];
        const archivedOrders = data.archived || []; // Mengambil data pesanan yang sudah selesai

        const cleanInput = inputVal.toLowerCase().replace(/\D/g, '');
        const searchStr = inputVal.toLowerCase();

        // --- CEK 1: APAKAH MASIH ANTRE (PENDING)? ---
        const targetIndex = pendingOrders.findIndex(o => {
            const cleanId = String(o.id || '').toLowerCase();
            const cleanPhone = String(o.phone || '').replace(/\D/g, '');
            return cleanId.includes(searchStr) || (cleanInput && cleanPhone.endsWith(cleanInput));
        });

        if (targetIndex !== -1) {
            // SKENARIO A: MASIH ANTRE (Tampilkan Estimasi & Jam Live)
            const myOrder = pendingOrders[targetIndex];
            const queuePos = targetIndex + 1;

            // Hitung halaman di depan
            let totalHalamanDiDepan = 0;
            for (let i = 0; i < targetIndex; i++) {
                totalHalamanDiDepan += (parseInt(pendingOrders[i].jumlahHalaman) || 1);
            }

            // Hitung menit
            const estimasiDetik = (totalHalamanDiDepan * 5) + (targetIndex * 120);
            let estimasiMenit = Math.max(1, Math.ceil(estimasiDetik / 60));
            
            const isNext = queuePos === 1;
            if (isNext) estimasiMenit = 3; // Max 3 menit jika antrian pertama

            // Hitung JAM LIVE (Waktu Sekarang + Estimasi Menit)
            const waktuSelesai = new Date();
            waktuSelesai.setMinutes(waktuSelesai.getMinutes() + estimasiMenit);
            const jamText = waktuSelesai.getHours().toString().padStart(2, '0') + ':' + waktuSelesai.getMinutes().toString().padStart(2, '0');

            const statusBadge = isNext 
                ? '<span style="background:#ef4444; color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px;">🔥 Sedang/Siap Dicetak</span>'
                : `<span style="background:#3b82f6; color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px;">⏳ Antrian #${queuePos}</span>`;

            const estimasiTeks = isNext 
                ? `± 1 - 3 Menit (Sekitar pukul ${jamText} WIB)`
                : `± ${estimasiMenit} Menit (Sekitar pukul ${jamText} WIB)`;

            trackResultEl.innerHTML = `
                <div style="background:white; padding:14px; border-radius:10px; border:1px solid #bfdbfe; font-size:13px; color:#1e293b;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong>${myOrder.nama} <small style="color:#64748b;">(${myOrder.id})</small></strong>
                        ${statusBadge}
                    </div>
                    <hr style="border:none; border-top:1px solid #e2e8f0; margin:8px 0;">
                    <p style="margin:4px 0;">📄 <b>Dokumen:</b> ${myOrder.fileName} (${myOrder.jumlahHalaman} Hal - ${myOrder.jenisCetak})</p>
                    <p style="margin:4px 0;">👥 <b>Antrian di Depan:</b> ${targetIndex} Pesanan (${totalHalamanDiDepan} Halaman)</p>
                    <p style="margin:6px 0 0 0; color:#1d4ed8; font-size:14px; font-weight:bold;">
                        ⏱️ <b>Estimasi Selesai:</b> ${estimasiTeks}
                    </p>
                </div>
            `;
            return;
        }

        // --- CEK 2: APAKAH SUDAH SELESAI (ARCHIVE)? ---
        const archiveIndex = archivedOrders.findIndex(o => {
            const cleanId = String(o.id || '').toLowerCase();
            const cleanPhone = String(o.phone || '').replace(/\D/g, '');
            return cleanId.includes(searchStr) || (cleanInput && cleanPhone.endsWith(cleanInput));
        });

        if (archiveIndex !== -1) {
            // SKENARIO B: SUDAH SELESAI (Tampilan Hijau Sukses)
            const myOrder = archivedOrders[archiveIndex];
            trackResultEl.innerHTML = `
                <div style="background:#f0fdf4; padding:14px; border-radius:10px; border:1px solid #86efac; font-size:13px; color:#166534;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="color:#15803d;">${myOrder.nama} <small style="color:#166534;">(${myOrder.id})</small></strong>
                        <span style="background:#22c55e; color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px;">✅ Selesai</span>
                    </div>
                    <hr style="border:none; border-top:1px solid #bbf7d0; margin:8px 0;">
                    <p style="margin:4px 0;">📄 <b>Dokumen:</b> ${myOrder.fileName} (${myOrder.jumlahHalaman} Hal - ${myOrder.jenisCetak})</p>
                    <p style="margin:6px 0 0 0; font-size:14px; font-weight:bold; color:#15803d;">
                        🎉 Pesanan Anda sudah selesai dicetak dan siap untuk diambil!
                    </p>
                </div>
            `;
            return;
        }

        // --- SKENARIO C: TIDAK DITEMUKAN (Tampilan Merah Error) ---
        trackResultEl.innerHTML = `
            <div style="background:#fef2f2; padding:12px; border-radius:8px; border:1px solid #fca5a5; color:#b91c1c; font-size:13px;">
                ❌ <b>Pesanan tidak ditemukan.</b> Pastikan ID Pesanan atau Nomor WhatsApp yang Anda masukkan sudah benar.
            </div>
        `;

    } catch (err) {
        console.error("Tracking error:", err);
        trackResultEl.innerHTML = '<p style="font-size:13px; color:#ef4444;">Gagal mengambil data pesanan. Coba lagi nanti.</p>';
    }
}

// 3. Cari Riwayat Pesanan & Fast Re-Order (Returning Customer)
async function cariRiwayatPesanan() {
    const searchPhoneInput = document.getElementById('searchPhone')?.value.trim();
    const historyResultEl = document.getElementById('historyResult');

    if (!searchPhoneInput) {
        alert("Masukkan nomor WhatsApp terlebih dahulu!");
        return;
    }

    if (!historyResultEl) return;

    historyResultEl.style.display = 'block';
    historyResultEl.innerHTML = '<p style="font-size:13px; color:#64748b;">Mencari riwayat pesanan...</p>';

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
        const data = await res.json();
        const allOrders = [...(data.orders || []), ...(data.archived || [])];

        const matchedOrders = allOrders.filter(o => {
            const cleanPhone = String(o.phone || '').replace(/\D/g, '');
            const cleanInput = searchPhoneInput.replace(/\D/g, '');
            return cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone);
        });

        if (matchedOrders.length === 0) {
            historyResultEl.innerHTML = '<p style="font-size:13px; color:#ef4444;">Belum ada riwayat pesanan untuk nomor ini.</p>';
            return;
        }

        let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
        matchedOrders.slice(-3).reverse().forEach(item => {
            html += `
                <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:13px; color:#1e293b;">${item.nama}</strong> 
                        <span style="font-size:11px; color:#64748b;">(${item.jenisCetak} - ${item.jumlahHalaman} Hal)</span><br>
                        <small style="font-size:11px; color:#94a3b8;">Catatan: ${item.catatan || '-'}</small>
                    </div>
                    <button type="button" onclick="fastReOrder('${encodeURIComponent(item.nama)}', '${encodeURIComponent(item.phone)}', '${encodeURIComponent(item.jenisCetak)}', '${encodeURIComponent(item.catatan)}')" 
                        style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; font-size:12px; cursor:pointer;">
                        ⚡ Pesan Lagi
                    </button>
                </div>
            `;
        });
        html += '</div>';

        historyResultEl.innerHTML = html;

    } catch (err) {
        console.error("Error fetching history:", err);
        historyResultEl.innerHTML = '<p style="font-size:13px; color:#ef4444;">Gagal mengambil riwayat. Coba lagi nanti.</p>';
    }
}

function fastReOrder(namaEncoded, phoneEncoded, jenisCetakEncoded, catatanEncoded) {
    const nama = decodeURIComponent(namaEncoded);
    const phone = decodeURIComponent(phoneEncoded);
    const jenisCetak = decodeURIComponent(jenisCetakEncoded);
    const catatan = decodeURIComponent(catatanEncoded);

    if (document.getElementById('nama')) document.getElementById('nama').value = nama;
    if (document.getElementById('phone')) document.getElementById('phone').value = phone;
    if (document.getElementById('jenisCetak')) document.getElementById('jenisCetak').value = jenisCetak;
    if (document.getElementById('catatan')) document.getElementById('catatan').value = catatan;

    hitungTotalBiaya();
    document.getElementById('orderForm')?.scrollIntoView({ behavior: 'smooth' });
    alert(`Data pesanan ${nama} berhasil diisi otomatis! Silakan upload file baru dan klik Kirim.`);
}

// 4. Kirim Form Pemesanan
document.getElementById('orderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-loading"><span class="spinner"></span> <span>Memproses Pesanan...</span></span>`;
    }

    try {
        const nama = document.getElementById('nama')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const jumlahHalaman = document.getElementById('jumlahHalaman')?.value || '1';
        const jenisCetak = document.getElementById('jenisCetak')?.value || 'Hitam Putih';
        const catatan = document.getElementById('catatan')?.value.trim() || '-';
        const fileInput = document.getElementById('file');
        const fileName = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : 'Tidak Ada File';

        const { formatted: totalHargaFormatted } = hitungTotalBiaya();
        const orderId = 'KC-' + Date.now();

        const payload = {
            id: orderId,
            nama: nama,
            phone: phone,
            jumlahHalaman: jumlahHalaman,
            jenisCetak: jenisCetak,
            fileName: fileName,
            catatan: catatan
        };

        const queryParams = new URLSearchParams(payload).toString();
        fetch(`${GOOGLE_SCRIPT_URL}?${queryParams}`, {
            method: 'GET',
            mode: 'no-cors'
        });

        const elOrderId = document.getElementById('modalOrderId');
        const elNama = document.getElementById('modalNama');
        const elFile = document.getElementById('modalFile');
        const elDetail = document.getElementById('modalDetail');
        const elTotal = document.getElementById('modalTotalHarga');

        if (elOrderId) elOrderId.innerText = orderId;
        if (elNama) elNama.innerText = nama;
        if (elFile) elFile.innerText = fileName;
        if (elDetail) elDetail.innerText = `${jumlahHalaman} Halaman (${jenisCetak})`;
        if (elTotal) elTotal.innerText = totalHargaFormatted;

        setTimeout(() => {
            const modal = document.getElementById('orderModal');
            if (modal) modal.style.display = 'flex';

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
            }
        }, 500);

        const pesanWA = `Halo Admin KohanCopier,\n\nSaya telah membuat pesanan cetak dokumen baru:` +
            `\n- *ID Pesanan:* ${orderId}` +
            `\n- *Nama:* ${nama}` +
            `\n- *No WA:* ${phone}` +
            `\n- *Jumlah Halaman:* ${jumlahHalaman}` +
            `\n- *Jenis Cetak:* ${jenisCetak}` +
            `\n- *Total Biaya:* ${totalHargaFormatted}` +
            `\n- *Nama File:* ${fileName}` +
            `\n- *Catatan:* ${catatan}` +
            `\n\nMohon dicek dan diproses. Terima kasih!`;

        const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(pesanWA)}`;

        const btnGoToWA = document.getElementById('btnGoToWA');
        if (btnGoToWA) {
            btnGoToWA.onclick = function() {
                window.location.href = urlWA;
            };
        }

    } catch (error) {
        console.error("Error processing form:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
        }
    }
});