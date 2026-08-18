document.getElementById('trackForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const orderId = document.getElementById('orderIdInput').value.trim();
    const resultDiv = document.getElementById('trackResult');

    if (!orderId) return;

    try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (res.ok && data.success) {
            const order = data.order;
            resultDiv.innerHTML = `
                <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-top: 15px; background: #fff;">
                    <h3 style="margin-bottom: 10px;">Status Pesanan: <span style="color: blue;">${order.status}</span></h3>
                    <p><strong>ID:</strong> ${order.id}</p>
                    <p><strong>Nama:</strong> ${order.nama}</p>
                    <p><strong>Detail:</strong> ${order.jumlahHalaman} Halaman (${order.jenisCetak})</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<p style="color: red; margin-top: 15px;">${data.message || 'Pesanan tidak ditemukan.'}</p>`;
        }
    } catch (err) {
        console.error(err);
        alert('Gagal mengambil data pesanan.');
    }
});