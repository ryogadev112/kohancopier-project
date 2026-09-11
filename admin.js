// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdXRmY3NoaGdwcHlnaXB4emZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjQxNDMsImV4cCI6MjEwNDcwMDE0M30.vhd6pH6jkNsbnnZsjgonc8xGc7yk-rQIZSgegiXbmBs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLoginSubmit = document.getElementById('btnLoginSubmit');
const adminUserLabel = document.getElementById('adminUserLabel');

// --- CEK SESI LOGIN SAAT HALAMAN DIBUKA ---
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        showDashboard(session.user);
    } else {
        showLoginForm();
    }
});

function showLoginForm() {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
}

function showDashboard(user) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (adminUserLabel) adminUserLabel.innerText = `Login sebagai: ${user.email}`;
    loadOrders();
}

// --- FUNGSI LOGIN SUPABASE AUTH ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        btnLoginSubmit.disabled = true;
        btnLoginSubmit.innerText = "⏳ Memverifikasi...";

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            loginError.innerText = "❌ Email atau Password salah!";
            loginError.style.display = 'block';
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerText = "Masuk ke Dasbor 🚀";
        } else {
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerText = "Masuk ke Dasbor 🚀";
            showDashboard(data.user);
        }
    });
}

// --- FUNGSI LOGOUT ---
async function logoutAdmin() {
    if (confirm("Apakah Anda yakin ingin keluar dari Dashboard Admin?")) {
        await supabaseClient.auth.signOut();
        showLoginForm();
    }
}

// --- MEMUAT DATA PESANAN DARI SUPABASE ---
async function loadOrders() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">⏳ Memuat data pesanan...</td></tr>';

    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color:#ef4444; padding: 20px;">❌ Gagal memuat data dari database.</td></tr>';
        return;
    }

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Belum ada pesanan masuk.</td></tr>';
        return;
    }

    let html = '';
    orders.forEach(o => {
        const dateStr = new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
        
        // Proteksi: Cek apakah status aman untuk dihapus (SELESAI atau SIAP DIAMBIL)
        const isSafeToDelete = o.status.includes('SELESAI') || o.status.includes('SIAP');

        html += `
            <tr>
                <td style="font-weight: bold; color: #38bdf8; font-size: 15px;">${o.no_antrian || '-'}</td>
                <td style="font-size: 12px; color: #94a3b8;">${dateStr}</td>
                <td>
                    <b>${o.nama}</b><br>
                    <span style="font-size: 12px; color: #94a3b8;">${o.phone}</span><br>
                    <a href="https://wa.me/${o.phone}" target="_blank" style="display:inline-block; margin-top:4px; padding:2px 8px; background:#22c55e; color:white; border-radius:4px; text-decoration:none; font-size:11px; font-weight:bold;">📱 Chat WA</a>
                </td>
                <td>${o.detail_cetak}</td>
                <td style="font-style: italic; color: #cbd5e1;">${o.catatan || '-'}</td>
                <td style="color: #38bdf8; font-weight: bold;">${o.waktu_ambil}</td>
                <td style="color: #4ade80; font-weight: bold;">Rp ${Number(o.total_harga).toLocaleString('id-ID')}</td>
                <td>
                    ${o.file_url ? `<a href="${o.file_url}" target="_blank" style="padding:6px 12px; background:#16a34a; color:white; border-radius:6px; text-decoration:none; font-weight:bold; font-size:12px;" download>📥 Download File</a>` : '<span style="color:#94a3b8;">Tanpa File</span>'}
                </td>
                <td>
                    <select onchange="updateStatus(${o.id}, this.value)" style="padding:6px; border-radius:6px; background:#0f172a; color:white; border:1px solid #475569; font-weight:bold; cursor:pointer;">
                        <option value="Menunggu Pembayaran (UNPAID)" ${o.status.includes('UNPAID') ? 'selected' : ''}>⏳ UNPAID</option>
                        <option value="🖨️ DIPROSES" ${o.status.includes('DIPROSES') ? 'selected' : ''}>🖨️ DIPROSES</option>
                        <option value="✅ SIAP DIAMBIL" ${o.status.includes('SIAP') ? 'selected' : ''}>✅ SIAP DIAMBIL</option>
                        <option value="🎉 SELESAI" ${o.status.includes('SELESAI') ? 'selected' : ''}>🎉 SELESAI</option>
                    </select>
                </td>
                <td>
                    <button onclick="deleteOrder(${o.id}, '${o.status.replace(/'/g, "\\'")}')" 
                            style="padding:6px 12px; border-radius:6px; border:none; font-weight:bold; font-size:12px; cursor:${isSafeToDelete ? 'pointer' : 'not-allowed'}; background:${isSafeToDelete ? '#dc2626' : '#475569'}; color:${isSafeToDelete ? 'white' : '#94a3b8'};"
                            title="${isSafeToDelete ? 'Hapus Pesanan' : 'Ubah status ke SIAP DIAMBIL / SELESAI untuk menghapus'}">
                        🗑️ Hapus
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// --- FUNGSI UPDATE STATUS PESANAN ---
async function updateStatus(id, newStatus) {
    const { error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        alert('❌ Gagal mengubah status pesanan.');
    } else {
        loadOrders(); // Refresh otomatis agar tombol Hapus ter-update statusnya
    }
}

// --- FUNGSI HAPUS PESANAN (DENGAN PROTEKSI STATUS) ---
async function deleteOrder(id, status) {
    const isSafe = status.includes('SELESAI') || status.includes('SIAP');

    if (!isSafe) {
        alert('⚠️ Pesanan tidak dapat dihapus!\n\nUntuk alasan keamanan, ubah status pesanan menjadi "✅ SIAP DIAMBIL" atau "🎉 SELESAI" terlebih dahulu sebelum menghapus.');
        return;
    }

    if (confirm('⚠️ Apakah Anda yakin ingin menghapus pesanan ini secara permanen? Data yang dihapus tidak bisa dikembalikan.')) {
        const { error } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            alert('❌ Gagal menghapus pesanan: ' + error.message);
        } else {
            alert('✅ Pesanan berhasil dihapus.');
            loadOrders(); // Refresh tabel
        }
    }
}