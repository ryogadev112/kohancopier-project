const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyotw4ez7OI14rmdQVuHsdBGHx3t1z4WcLnSGWNF17yXMQ3FJzsv1HZWUWRFlXFS84Psg/exec";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();

            if (usernameInput === 'admin' && passwordInput === 'admin123') {
                alert('Login Berhasil!');
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboardSection').style.display = 'block';
                loadOrders();
            } else {
                alert('Username atau Password salah!');
            }
        });
    }
});

async function loadOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Mengambil data pesanan...</td></tr>';
    }

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
        const data = await res.json();

        if (!tableBody) return;
        tableBody.innerHTML = '';

        const orderList = Array.isArray(data) ? data : (data.orders || []);

        if (orderList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: #64748b;">Belum ada pesanan aktif.</td></tr>';
            return;
        }

        orderList.slice().reverse().forEach(order => {
            const id = order.id || '-';
            const nama = order.nama || '-';
            const phone = order.phone || '-';
            const jumlahHalaman = order.jumlahHalaman || '0';
            const jenisCetak = order.jenisCetak || 'Hitam Putih';
            const fileName = order.fileName || '-';

            const row = `
                <tr>
                    <td><b>${id}</b></td>
                    <td>${nama}</td>
                    <td><a href="https://wa.me/${phone}" target="_blank" style="color: #2563eb; font-weight:600; text-decoration:none;">📱 ${phone}</a></td>
                    <td>${jumlahHalaman} Hal (${jenisCetak})</td>
                    <td><span style="background:#fef3c7; color:#d97706; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:12px;">Pending</span></td>
                    <td>📄 ${fileName}</td>
                    <td>
                        <button onclick="archiveOrder('${id}')" style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                            ✅ Selesai & Arsip
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading orders:', err);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#ef4444;">Gagal mengambil data. Klik "Refresh Data".</td></tr>';
        }
    }
}

async function archiveOrder(orderId) {
    if (!confirm(`Tandai pesanan ${orderId} sebagai SELESAI dan pindahkan ke Arsip?`)) return;

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'archive', id: orderId })
        });

        alert(`Pesanan ${orderId} berhasil diarsipkan!`);
        setTimeout(loadOrders, 1500);
    } catch (err) {
        console.error("Error archiving order:", err);
        alert("Gagal mengarsip pesanan.");
    }
}