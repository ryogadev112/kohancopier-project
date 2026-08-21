const GOOGLE_SCRIPT_URL_TRACK = "https://script.google.com/macros/s/AKfycbyotw4ez7OI14rmdQVuHsdBGHx3t1z4WcLnSGWNF17yXMQ3FJzsv1HZWUWRFlXFS84Psg/exec";

document.getElementById('trackForm')?.addEventListener('submit', async function(e) {
    // 1. Mencegah browser refresh / kembali ke halaman utama
    e.preventDefault();

    const orderIdInput = document.getElementById('orderIdInput')?.value.trim();
    const resultDiv = document.getElementById('trackResult');

    if (!orderIdInput || !resultDiv) return;

    resultDiv.innerHTML = '<p style="margin-top: 15px; font-size: 13px; color: #64748b; text-align: center;">Mencari status pesanan...</p>';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL_TRACK);
        const data = await res.json();

        // Cari di pesanan aktif (Orders)
        const activeOrder = data.orders?.find(o => o.id.toLowerCase() === orderIdInput.toLowerCase());
        
        // Cari di pesanan yang sudah diarsip (Archive)
        const archivedOrder = data.archived?.find(o => o.id.toLowerCase() === orderIdInput.toLowerCase());

        if (activeOrder) {
            resultDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 13px;">
                    <p><strong>ID Pesanan:</strong> ${activeOrder.id}</p>
                    <p><strong>Nama:</strong> ${activeOrder.nama}</p>
                    <p><strong>Detail:</strong> ${activeOrder.jumlahHalaman} Hal (${activeOrder.jenisCetak})</p>
                    <p><strong>Status:</strong> <span style="background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 6px; font-weight: bold;">⏳ Sedang Diproses / Pending</span></p>
                </div>
            `;
        } else if (archivedOrder) {
            resultDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 13px;">
                    <p><strong>ID Pesanan:</strong> ${archivedOrder.id}</p>
                    <p><strong>Nama:</strong> ${archivedOrder.nama}</p>
                    <p><strong>Detail:</strong> ${archivedOrder.jumlahHalaman} Hal (${archivedOrder.jenisCetak})</p>
                    <p><strong>Status:</strong> <span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 6px; font-weight: bold;">✅ Pesanan Selesai / Sudah Diambil</span></p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; font-size: 13px; color: #991b1b; text-align: center;">
                    ❌ ID Pesanan <strong>${orderIdInput}</strong> tidak ditemukan. Periksa kembali ID pesanan Anda.
                </div>
            `;
        }
    } catch (err) {
        console.error("Error tracking order:", err);
        resultDiv.innerHTML = '<p style="margin-top: 15px; font-size: 13px; color: #ef4444; text-align: center;">Gagal mengambil data. Silakan coba lagi.</p>';
    }
});