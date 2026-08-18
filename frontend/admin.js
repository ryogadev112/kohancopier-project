document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        // Memanggil endpoint backend
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            alert('Login Berhasil!');
            
            // Sembunyikan form login & tampilkan dashboard
            const loginSection = document.getElementById('loginSection');
            const dashboardSection = document.getElementById('dashboardSection');
            
            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';

            // Muat data pesanan
            if (typeof loadOrders === 'function') {
                loadOrders();
            }
        } else {
            alert(data.message || 'Username atau Password salah!');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Gagal menghubungkan ke server. Pastikan jaringan stabil.');
    }
});