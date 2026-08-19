const NOMOR_WA_ADMIN = "6288218475220";

document.getElementById('orderForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Menyimpan & Mengirim...';
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
        nama,
        phone,
        jumlahHalaman,
        jenisCetak,
        catatan,
        fileName
    };

    try {
        // Simpan data ke Vercel API
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Buat Pesan WA
        const pesanWA = `Halo Admin KohanCopier,\n\nSaya telah membuat pesanan cetak dokumen baru:` +
            `\n- *ID Pesanan:* ${orderId}` +
            `\n- *Nama:* ${nama}` +
            `\n- *No WA:* ${phone}` +
            `\n- *Jumlah Halaman:* ${jumlahHalaman}` +
            `\n- *Jenis Cetak:* ${jenisCetak}` +
            `\n- *Nama File:* ${fileName}` +
            `\n- *Catatan:* ${catatan}` +
            `\n\nMohon dicek dan diproses. Terima kasih!`;

        const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(pesanWA)}`;

        // Pindah ke WhatsApp
        window.location.href = urlWA;

    } catch (error) {
        console.error('Error submit order:', error);
        alert('Gagal menyimpan pesanan. Silakan coba lagi.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = '🚀 Kirim Pesanan Sekarang';
        }
    }
});