const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6hlU7FtCH4-NDlKUkew1NjeBoaui3aR0UhYHDnzfUyTKYyhn45q4xPIpC4AuXm-lxIg/exec";
const NOMOR_WA_ADMIN = "6281318541990";

let countdownInterval = null;
let remainingSeconds = 600; // 10 menit

function startQrisTimer() {
    clearInterval(countdownInterval);
    remainingSeconds = 600;
    
    const timerEl = document.getElementById('qrisTimer');
    const badgeEl = document.getElementById('floatingTimerBadge');

    countdownInterval = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            if (timerEl) timerEl.innerHTML = "⏱️ Waktu Pembayaran Habis!";
            if (badgeEl) badgeEl.innerText = "Expired";
            return;
        }

        remainingSeconds--;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timerEl) timerEl.innerHTML = `⏱️ ${timeFormatted}`;
        if (badgeEl) badgeEl.innerText = timeFormatted;
    }, 1000);
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    const floatingBtn = document.getElementById('floatingQrisBtn');
    
    if (modal) modal.style.display = 'none';
    if (floatingBtn && remainingSeconds > 0) {
        floatingBtn.style.display = 'flex';
    }
}

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    const floatingBtn = document.getElementById('floatingQrisBtn');

    if (modal) modal.style.display = 'flex';
    if (floatingBtn) floatingBtn.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const jumlahHalamanInput = document.getElementById('jumlahHalaman');
    const jenisCetakSelect = document.getElementById('jenisCetak');
    const pricePreview = document.getElementById('pricePreview');

    function hitungHarga() {
        const hal = parseInt(jumlahHalamanInput.value) || 0;
        const jenis = jenisCetakSelect.value;
        const tarif = jenis === 'Warna' ? 2000 : 1000;
        const total = hal * tarif;
        if (pricePreview) {
            pricePreview.innerText = 'Rp ' + total.toLocaleString('id-ID');
        }
    }

    if (jumlahHalamanInput) jumlahHalamanInput.addEventListener('input', hitungHarga);
    if (jenisCetakSelect) jenisCetakSelect.addEventListener('change', hitungHarga);

    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Sedang Mengirim Pesanan...</span>';
            }

            const nama = document.getElementById('nama').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const jumlahHalaman = document.getElementById('jumlahHalaman').value;
            const jenisCetak = document.getElementById('jenisCetak').value;
            const fileInput = document.getElementById('file');
            const fileName = fileInput.files[0] ? fileInput.files[0].name : 'Dokumen.pdf';
            const catatan = document.getElementById('catatan').value.trim();

            const orderId = 'KC-' + Date.now();
            const tarif = jenisCetak === 'Warna' ? 2000 : 1000;
            const totalHarga = parseInt(jumlahHalaman) * tarif;
            const totalHargaFormatted = 'Rp ' + totalHarga.toLocaleString('id-ID');

            const payload = {
                id: orderId,
                nama: nama,
                phone: phone,
                jumlahHalaman: jumlahHalaman,
                jenisCetak: jenisCetak,
                fileName: fileName,
                catatan: catatan
            };

            try {
                const queryParams = new URLSearchParams(payload).toString();
                await fetch(`${GOOGLE_SCRIPT_URL}?${queryParams}`);

                document.getElementById('modalOrderId').innerText = orderId;
                document.getElementById('modalNama').innerText = nama;
                document.getElementById('modalDetail').innerText = `${jumlahHalaman} Halaman (${jenisCetak})`;
                document.getElementById('modalTotalHarga').innerText = totalHargaFormatted;

                const pesanWA = `Halo Admin KohanCopier, saya sudah membuat pesanan dengan detail berikut:%0A%0A*ID Pesanan:* ${orderId}%0A*Nama:* ${nama}%0A*Total Bayar (QRIS):* ${totalHargaFormatted}%0A*File:* ${fileName}%0A%0ABerikut saya lampirkan bukti pembayarannya. Mohon segera diproses ya!`;
                
                const btnGoToWA = document.getElementById('btnGoToWA');
                if (btnGoToWA) {
                    btnGoToWA.href = `https://wa.me/${NOMOR_WA_ADMIN}?text=${pesanWA}`;
                    btnGoToWA.onclick = function() {
                        closeOrderModal();
                    };
                }

                setTimeout(() => {
                    openOrderModal();
                    startQrisTimer();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
                    }
                    orderForm.reset();
                    hitungHarga();
                }, 500);

            } catch (err) {
                console.error('Error:', err);
                alert('Gagal mengirim pesanan. Silakan coba lagi.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>🚀 Kirim Pesanan Sekarang</span>';
                }
            }
        });
    }
});

async function cariRiwayatPesanan() {
    const searchPhone = document.getElementById('searchPhone')?.value.trim();
    const historyResult = document.getElementById('historyResult');

    if (!searchPhone) {
        alert('Masukkan nomor WhatsApp terlebih dahulu!');
        return;
    }

    if (historyResult) {
        historyResult.style.display = 'block';
        historyResult.innerHTML = '<span style="color:#64748b; font-size:13px;">Mencari riwayat...</span>';
    }

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
        const data = await res.json();
        const allOrders = [...(data.orders || []), ...(data.archived || [])];

        const lastOrder = allOrders.reverse().find(o => o.phone && o.phone.includes(searchPhone));

        if (lastOrder) {
            document.getElementById('nama').value = lastOrder.nama || '';
            document.getElementById('phone').value = lastOrder.phone || '';
            document.getElementById('jumlahHalaman').value = lastOrder.jumlahHalaman || 1;
            document.getElementById('jenisCetak').value = lastOrder.jenisCetak || 'Hitam Putih';
            document.getElementById('catatan').value = lastOrder.catatan || '';

            // Update preview harga
            const tarif = lastOrder.jenisCetak === 'Warna' ? 2000 : 1000;
            const total = (parseInt(lastOrder.jumlahHalaman) || 1) * tarif;
            document.getElementById('pricePreview').innerText = 'Rp ' + total.toLocaleString('id-ID');

            historyResult.innerHTML = '<span style="color:#16a34a; font-size:13px; font-weight:600;">✅ Data dari pesanan terakhir berhasil dimuat ke form!</span>';
        } else {
            historyResult.innerHTML = '<span style="color:#dc2626; font-size:13px;">❌ Riwayat dengan nomor tersebut tidak ditemukan.</span>';
        }
    } catch (err) {
        console.error(err);
        if (historyResult) {
            historyResult.innerHTML = '<span style="color:#dc2626; font-size:13px;">Gagal memuat riwayat.</span>';
        }
    }
}

async function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput')?.value.trim();
    const trackResult = document.getElementById('trackResult');

    if (!keyword) {
        alert('Masukkan ID Pesanan atau Nomor WhatsApp!');
        return;
    }

    if (trackResult) {
        trackResult.style.display = 'block';
        trackResult.innerHTML = '<span style="color:#64748b; font-size:14px;">Mencari status pesanan...</span>';
    }

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
        const data = await res.json();

        const activeOrders = data.orders || [];
        const archivedOrders = data.archived || [];

        let foundOrder = null;
        let isArchived = false;
        let queueNum = '-';

        const activeIndex = activeOrders.findIndex(o => 
            (o.id && o.id.toLowerCase().includes(keyword.toLowerCase())) || 
            (o.phone && o.phone.includes(keyword))
        );

        if (activeIndex !== -1) {
            foundOrder = activeOrders[activeIndex];
            queueNum = activeIndex + 1;
        } else {
            const arcMatch = archivedOrders.find(o => 
                (o.id && o.id.toLowerCase().includes(keyword.toLowerCase())) || 
                (o.phone && o.phone.includes(keyword))
            );
            if (arcMatch) {
                foundOrder = arcMatch;
                isArchived = true;
            }
        }

        if (foundOrder) {
            const statusBadge = isArchived 
                ? '<span style="background:#dcfce7; color:#16a34a; padding:4px 10px; border-radius:6px; font-weight:bold;">Selesai / Diambil</span>'
                : `<span style="background:#fef3c7; color:#d97706; padding:4px 10px; border-radius:6px; font-weight:bold;">Pending (Antrian #${queueNum})</span>`;

            trackResult.innerHTML = `
                <div style="background:white; padding:16px; border-radius:8px; border:1px solid #cbd5e1; text-align:left; font-size:14px; line-height:1.6;">
                    <p style="margin:4px 0;"><b>ID:</b> ${foundOrder.id}</p>
                    <p style="margin:4px 0;"><b>Nama:</b> ${foundOrder.nama}</p>
                    <p style="margin:4px 0;"><b>File:</b> ${foundOrder.fileName}</p>
                    <p style="margin:4px 0;"><b>Detail:</b> ${foundOrder.jumlahHalaman} Hal (${foundOrder.jenisCetak})</p>
                    <p style="margin:8px 0 4px 0;"><b>Status:</b><br>${statusBadge}</p>
                </div>
            `;
        } else {
            trackResult.innerHTML = '<span style="color:#dc2626; font-size:14px;">❌ Pesanan tidak ditemukan. Periksa kembali ID atau No WA Anda.</span>';
        }
    } catch (err) {
        console.error(err);
        if (trackResult) {
            trackResult.innerHTML = '<span style="color:#dc2626; font-size:14px;">Gagal melacak pesanan.</span>';
        }
    }
}