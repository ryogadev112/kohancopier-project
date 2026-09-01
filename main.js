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

// 2. FITUR STEP 2: Cari Riwayat Pesanan & Fast Re-Order (Returning Customer)
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

        // Gabungkan pesanan aktif (orders) dan arsip (archived)
        const allOrders = [...(data.orders || []), ...(data.archived || [])];

        // Filter berdasarkan nomor telepon
        const matchedOrders = allOrders.filter(o => {
            const cleanPhone = String(o.phone || '').replace(/\D/g, '');
            const cleanInput = searchPhoneInput.replace(/\D/g, '');
            return cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone);
        });

        if (matchedOrders.length === 0) {
            historyResultEl.innerHTML = '<p style="font-size:13px; color:#ef4444;">Belum ada riwayat pesanan untuk nomor ini.</p>';
            return;
        }

        // Ambil maksimal 3 pesanan terakhir
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

// Auto-fill form dari riwayat pesanan
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

    // Scroll ke form pemesanan
    document.getElementById('orderForm')?.scrollIntoView({ behavior: 'smooth' });
    alert(`Data pesanan ${nama} berhasil diisi otomatis! Silakan upload file baru dan klik Kirim.`);
}

// 3. Kirim Form Pemesanan
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