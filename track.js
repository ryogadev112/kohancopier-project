const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygZAOIByubAG6QRE7aG8NkWCkUhvNIOVC3XAb0p5BL4FAlTbsE48HUmCkM-UNYF6XVgg/exec";

document.getElementById('trackForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const orderId = document.getElementById('orderIdInput').value.trim();
    const resultDiv = document.getElementById('trackResult');

    if (!orderId) return;

    resultDiv.innerHTML = '<p style="margin-top: 15px; color: #64748b;">Mencari data pesanan...</p>';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const data = await res.json();

        if (data.orders) {
            const order = data.orders.find(o => o.id === orderId);

            if (order) {
                resultDiv.innerHTML = `
                    <div style="border: 1px solid #10b981; padding: 18px; border-radius: 12px; margin-top: 15px; background: #ecfdf5;">
                        <h3 style="margin-bottom: 8px; color: #047857;">Pesanan Ditemukan! 🎉</h3>
                        <p><strong>ID Pesanan:</strong> ${order.id}</p>
                        <p><strong>Nama:</strong> ${order.nama}</p>
                        <p><strong>Detail:</strong> ${order.jumlahHalaman} Halaman (${order.jenisCetak})</p>
                        <p><strong>Nama File:</strong> ${order.fileName}</p>
                    </div>
                `;
                return;
            }
        }
        
        resultDiv.innerHTML = `<p style="color: #ef4444; margin-top: 15px; font-weight: 600;">ID Pesanan "${orderId}" tidak ditemukan.</p>`;

    } catch (err) {
        console.error(err);
        alert('Gagal mengambil data pesanan.');
    }
});