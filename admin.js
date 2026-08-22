const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6hlU7FtCH4-NDlKUkew1NjeBoaui3aR0UhYHDnzfUyTKYyhn45q4xPIpC4AuXm-lxIg/exec";
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username')?.value.trim();
            const passwordInput = document.getElementById('password')?.value.trim();

            if (usernameInput === 'admin' && passwordInput === 'admin123') {
                alert('Login Berhasil!');
                const loginSec = document.getElementById('loginSection');
                const dashSec = document.getElementById('dashboardSection');
                
                if (loginSec) loginSec.style.display = 'none';
                if (dashSec) dashSec.style.display = 'block';
                
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

function archiveOrder(orderId) {
    if (!confirm(`Tandai pesanan ${orderId} sebagai SELESAI dan pindahkan ke Arsip?`)) return;

    // Buat iframe tersembunyi untuk mengeksekusi request secara langsung
    const iframeName = 'hidden_archive_iframe_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Kirim request via Form submission alami
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = GOOGLE_SCRIPT_URL;
    form.target = iframeName;

    const inputAction = document.createElement('input');
    inputAction.type = 'hidden';
    inputAction.name = 'action';
    inputAction.value = 'archive';
    form.appendChild(inputAction);

    const inputId = document.createElement('input');
    inputId.type = 'hidden';
    inputId.name = 'id';
    inputId.value = orderId;
    form.appendChild(inputId);

    document.body.appendChild(form);
    form.submit();

    alert(`Pesanan ${orderId} dipindahkan ke Arsip!`);

    // Bersihkan DOM dan refresh tabel setelah 1.5 detik
    setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        loadOrders();
    }, 1500);
}