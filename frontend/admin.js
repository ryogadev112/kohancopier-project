document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            localStorage.setItem('adminToken', data.token);
            alert('Login Berhasil!');
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'block';
            loadOrders();
        } else {
            alert(data.message || 'Login gagal!');
        }
    } catch (err) {
        console.error(err);
        alert('Gagal menghubungkan ke server.');
    }
});

async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada pesanan.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.nama}</td>
                    <td>${order.phone}</td>
                    <td>${order.jumlahHalaman} (${order.jenisCetak})</td>
                    <td>${order.status}</td>
                    <td>${order.file}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading orders:', err);
    }
}