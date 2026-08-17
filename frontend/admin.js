document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    document.getElementById('loginOverlay').style.display = 'none';
    loadOrders();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
  }

  // Handle Form Login Admin
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPass').value;
    const loginError = document.getElementById('loginError');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (result.status === 'success') {
        localStorage.setItem('adminToken', result.token);
        document.getElementById('loginOverlay').style.display = 'none';
        loadOrders();
      } else {
        loginError.innerText = result.message;
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.innerText = 'Gagal menghubungkan ke server.';
      loginError.style.display = 'block';
    }
  });
});

// Load Daftar Pesanan
async function loadOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  const token = localStorage.getItem('adminToken');

  try {
    const response = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      logoutAdmin();
      return;
    }

    const result = await response.json();

    if (result.status === 'success' && result.data.length > 0) {
      tableBody.innerHTML = '';

      result.data.forEach(order => {
        const date = new Date(order.created_at).toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short'
        });

        const downloadButton = order.file_url 
          ? `<a href="${order.file_url}" target="_blank" class="btn-download" download>📥 Unduh PDF</a>`
          : `<span style="font-size: 12px; color: #94a3b8; font-style: italic;">🗑️ File Terhapus</span>`;

        const doneButton = order.status === 'Pending' 
          ? `<button onclick="markAsDone('${order.id}')" class="btn-done">✓ Selesai</button>` 
          : '';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${date}</td>
          <td><strong>${order.order_id}</strong></td>
          <td>${order.file_name}</td>
          <td>${order.total_pages} hal</td>
          <td>${order.paper_size} (${order.print_mode === 'bw' ? 'BW' : 'Color'}) | Jilid: ${order.binding_option}</td>
          <td><strong>Rp ${order.total_price.toLocaleString('id-ID')}</strong></td>
          <td>
            <span class="badge-status ${order.status === 'Selesai' ? 'status-selesai' : 'status-pending'}">
              ${order.status}
            </span>
          </td>
          <td style="display: flex; gap: 8px; align-items: center;">
            ${downloadButton}
            ${doneButton}
          </td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Belum ada pesanan masuk.</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

// Mengubah Status Pesanan Menjadi Selesai & Menghapus File PDF
async function markAsDone(orderDbId) {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await fetch(`/api/orders/${orderDbId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Selesai' })
    });

    const result = await response.json();
    if (result.status === 'success') {
      loadOrders();
    }
  } catch (err) {
    alert('Gagal memperbarui status: ' + err.message);
  }
}

// Logout Admin
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  location.reload();
}