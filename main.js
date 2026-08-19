const NOMOR_WA_ADMIN = "6288218475220";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygZAOIByubAG6QRE7aG8NkWCkUhvNIOVC3XAb0p5BL4FAlTbsE48HUmCkM-UNYF6XVgg/exec";

document.getElementById('orderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Memproses Pesanan...';
    }

    const nama = document.getElementById('nama')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const jumlahHalaman = document.getElementById('jumlahHalaman')?.value || '1';
    const jenisCetak = document.getElementById('jenisCetak')?.value || 'Hitam Putih';
    const catatan = document.getElementById('catatan')?.value.trim() || '-';
    const fileInput = document.getElementById('file');
    const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : 'Tidak Ada File';

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

    // 1. Kirim Data ke Google Sheets
    const params = new URLSearchParams(payload).toString();
    fetch(`${GOOGLE_SCRIPT_URL}?${params}`, {
        method: 'GET',
        mode: 'no-cors',
        keepalive: true
    });

    // 2. Tampilkan Detail di Modal
    document.getElementById('modalOrderId').innerText = orderId;
    document.getElementById('modalNama').innerText = nama;
    document.getElementById('modalFile').innerText = fileName;
    document.getElementById('modalDetail').innerText = `${jumlahHalaman} Halaman (${jenisCetak})`;

    // 3. Tampilkan Modal
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'flex';

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
    }

    // 4. Set Link WhatsApp
    const pesanWA = `Halo Admin KohanCopier,\n\nSaya telah membuat pesanan cetak dokumen baru:` +
        `\n- *ID Pesanan:* ${orderId}` +
        `\n- *Nama:* ${nama}` +
        `\n- *No WA:* ${phone}` +
        `\n- *Jumlah Halaman:* ${jumlahHalaman}` +
        `\n- *Jenis Cetak:* ${jenisCetak}` +
        `\n- *Nama File:* ${fileName}` +
        `\n- *Catatan:* ${catatan}` +
        `\n- *Status Pembayaran:* Menunggu Konfirmasi QRIS/Transfer` +
        `\n\nMohon dicek dan diproses. Terima kasih!`;

    const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(pesanWA)}`;

    const btnGoToWA = document.getElementById('btnGoToWA');
    if (btnGoToWA) {
        btnGoToWA.onclick = function() {
            window.location.href = urlWA;
        };
    }
});