document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;

            // Verifikasi Admin sederhana
            if (usernameInput === 'admin' && passwordInput === 'admin123') {
                alert('Login Berhasil!');
                
                // Sembunyikan Form Login & Tampilkan Dashboard
                const loginSection = document.getElementById('loginSection');
                const dashboardSection = document.getElementById('dashboardSection');

                if (loginSection) loginSection.style.display = 'none';
                if (dashboardSection) dashboardSection.style.display = 'block';

                // Muat daftar pesanan
                loadOrders();
            } else {
                alert('Username atau Password salah!');
            }
        });
    }
});

// Fungsi memuat data pesanan
async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada pesanan masuk.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.nama}</td>
                    <td>${order.phone}</td>
                    <td>${order.jumlahHalaman} halaman (${order.jenisCetak})</td>
                    <td><b style="color: green;">${order.status}</b></td>
                    <td>${order.file}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading orders:', err);
    }
}