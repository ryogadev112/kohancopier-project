const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyotw4ez7OI14rmdQVuHsdBGHx3t1z4WcLnSGWNF17yXMQ3FJzsv1HZWUWRFlXFS84Psg/exec";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();

            try {
                const res = await fetch('/api/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Login Berhasil!');
                    document.getElementById('loginSection').style.display = 'none';
                    document.getElementById('dashboardSection').style.display = 'block';
                    loadOrders();
                } else {
                    alert(data.message || 'Username atau Password salah!');
                }
            } catch (err) {
                console.error(err);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});

async function loadOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Mengambil data dari Google Sheets...</td></tr>';
    }

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const data = await res.json();

        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #64748b;">Belum ada pesanan masuk.</td></tr>';
            return;
        }

        data.orders.slice().reverse().forEach(order => {
            const row = `
                <tr>
                    <td><b>${order.id}</b></td>
                    <td>${order.nama}</td>
                    <td><a href="https://wa.me/${order.phone}" target="_blank" style="color: #2563eb; font-weight:600; text-decoration:none;">📱 ${order.phone}</a></td>
                    <td>${order.jumlahHalaman} Hal (${order.jenisCetak})</td>
                    <td><span style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:12px;">Pending</span></td>
                    <td>📄 ${order.fileName}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading orders:', err);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Gagal mengambil data. Klik "Refresh Data".</td></tr>';
        }
    }
}