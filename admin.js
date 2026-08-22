async function archiveOrder(orderId) {
    if (!confirm(`Tandai pesanan ${orderId} sebagai SELESAI dan pindahkan ke Arsip?`)) return;

    try {
        const queryParams = new URLSearchParams({
            action: 'archive',
            id: orderId,
            t: Date.now()
        }).toString();

        await fetch(`${GOOGLE_SCRIPT_URL}?${queryParams}`, {
            method: 'GET',
            mode: 'no-cors'
        });

        alert(`Pesanan ${orderId} berhasil dipindahkan ke Arsip!`);
        setTimeout(loadOrders, 1500);
    } catch (err) {
        console.error("Error archiving order:", err);
        alert("Gagal mengarsip pesanan.");
    }
}