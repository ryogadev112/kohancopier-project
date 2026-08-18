document.addEventListener('DOMContentLoaded', () => {
  const trackForm = document.getElementById('trackForm');
  const orderIdInput = document.getElementById('orderIdInput');
  const btnTrack = document.getElementById('btnTrack');
  const trackError = document.getElementById('trackError');
  const statusCard = document.getElementById('statusCard');

  trackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderId = orderIdInput.value.trim();
    if (!orderId) return;

    trackError.style.display = 'none';
    statusCard.classList.remove('active');
    btnTrack.disabled = true;
    btnTrack.innerText = 'Mencari...';

    try {
      const response = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`);
      const result = await response.json();

      if (result.status === 'success') {
        const order = result.data;

        document.getElementById('resOrderId').innerText = order.order_id;
        document.getElementById('resFileName').innerText = order.file_name;
        
        const modeText = order.print_mode === 'bw' ? 'Hitam-Putih' : 'Warna';
        document.getElementById('resFormat').innerText = `${order.total_pages} Hal | ${order.paper_size} (${modeText}) | Jilid: ${order.binding_option}`;

        const timeString = new Date(order.created_at).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        document.getElementById('resTime').innerText = timeString;
        document.getElementById('resPrice').innerText = 'Rp ' + order.total_price.toLocaleString('id-ID');

        // Update Badge Status
        const resBadge = document.getElementById('resBadge');
        resBadge.innerText = order.status;
        if (order.status === 'Selesai') {
          resBadge.className = 'badge-status status-selesai';
          resBadge.innerText = '✓ Selesai & Siap Diambil';
        } else {
          resBadge.className = 'badge-status status-pending';
          resBadge.innerText = '⏳ Sedang Diproses';
        }

        statusCard.classList.add('active');
      } else {
        trackError.innerText = result.message || 'Pesanan tidak ditemukan.';
        trackError.style.display = 'block';
      }
    } catch (err) {
      trackError.innerText = 'Gagal menghubungkan ke server.';
      trackError.style.display = 'block';
    } finally {
      btnTrack.disabled = false;
      btnTrack.innerText = 'Cek Status';
    }
  });
});