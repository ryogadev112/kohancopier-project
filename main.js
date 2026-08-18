const NOMOR_WA_ADMIN = "6288218475220";

document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Mengunggah & Memproses...';
    }

    const formData = new FormData(this);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const orderId = result.orderId || "KC-" + Date.now();
            const nama = formData.get('nama') || '';
            const jumlahHalaman = formData.get('jumlahHalaman') || '-';
            const jenisCetak = formData.get('jenisCetak') || '-';

            const pesanWA = `Halo Admin KohanCopier,\n\nSaya telah membuat pesanan cetak dokumen baru:` +
                `\n- *ID Pesanan:* ${orderId}` +
                `\n- *Nama:* ${nama}` +
                `\n- *Jumlah Halaman:* ${jumlahHalaman}` +
                `\n- *Jenis Cetak:* ${jenisCetak}` +
                `\n\nMohon dicek dan diproses. Terima kasih!`;

            const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(pesanWA)}`;

            alert(`Pesanan Berhasil! ID Pesanan Anda: ${orderId}\nAnda akan diarahkan ke WhatsApp untuk konfirmasi.`);
            
            window.open(urlWA, '_blank');
            this.reset();
        } else {
            alert('Gagal mengirim pesanan: ' + (result.message || 'Terjadi kesalahan pada server.'));
        }
    } catch (error) {
        console.error('Error submit order:', error);
        alert('Terjadi kesalahan koneksi saat mengirim data ke server.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Kirim Pesanan';
        }
    }
});