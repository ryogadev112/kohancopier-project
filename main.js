const NOMOR_WA_ADMIN = "6288218475220";

document.getElementById('orderForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-loading"><span class="spinner"></span> Memproses Pesanan...</span>`;
    }

    try {
        const nama = document.getElementById('nama')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const jumlahHalaman = document.getElementById('jumlahHalaman')?.value || '1';
        const jenisCetak = document.getElementById('jenisCetak')?.value || 'Hitam Putih';
        const catatan = document.getElementById('catatan')?.value.trim() || '-';
        const fileInput = document.getElementById('file');
        const fileName = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : 'Tidak Ada File';

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

        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const elOrderId = document.getElementById('modalOrderId');
        const elNama = document.getElementById('modalNama');
        const elFile = document.getElementById('modalFile');
        const elDetail = document.getElementById('modalDetail');

        if (elOrderId) elOrderId.innerText = orderId;
        if (elNama) elNama.innerText = nama;
        if (elFile) elFile.innerText = fileName;
        if (elDetail) elDetail.innerText = `${jumlahHalaman} Halaman (${jenisCetak})`;

        setTimeout(() => {
            const modal = document.getElementById('orderModal');
            if (modal) modal.style.display = 'flex';

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
            }
        }, 600);

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

        const btnGoToWA = document.getElementById('btnGoToWA');
        if (btnGoToWA) {
            btnGoToWA.onclick = function() {
                window.location.href = urlWA;
            };
        }

    } catch (error) {
        console.error("Error processing form:", error);
        alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
        }
    }
});