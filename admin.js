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
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        username: usernameInput, 
                        password: passwordInput 
                    })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Login Berhasil!');
                    
                    const loginSec = document.getElementById('loginSection');
                    const dashSec = document.getElementById('dashboardSection');
                    
                    if (loginSec) loginSec.style.display = 'none';
                    if (dashSec) dashSec.style.display = 'block';
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