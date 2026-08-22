const NOMOR_WA_ADMIN = "6288218475220";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyotw4ez7OI14rmdQVuHsdBGHx3t1z4WcLnSGWNF17yXMQ3FJzsv1HZWUWRFlXFS84Psg/exec";

// 1. Kalkulator Estimasi Biaya
function hitungTotalBiaya() {
    const elJumlah = document.getElementById('jumlahHalaman');
    const elJenis = document.getElementById('jenisCetak');
    const previewEl = document.getElementById('pricePreview');

    if (!elJumlah || !elJenis || !previewEl) return { total: 1000, formatted: 'Rp 1.000' };

    const jumlahHalaman = parseInt(elJumlah.value) || 1;
    const jenisCetak = elJenis.value || 'Hitam Putih';
    
    // Hitam Putih = Rp 1.000, Warna = Rp 2.000
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

// 2. Kirim Form Pemesanan
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

        // Kirim via GET URL Parameters ke Google Apps Script
        const params = new URLSearchParams(payload).toString();
        fetch(`${GOOGLE_SCRIPT_URL}?${params}`, {
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