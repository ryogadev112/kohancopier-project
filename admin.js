// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdXRmY3NoaGdwcHlnaXB4emZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjQxNDMsImV4cCI6MjEwNDcwMDE0M30.vhd6pH6jkNsbnnZsjgonc8xGc7yk-rQIZSgegiXbmBs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi memuat seluruh pesanan dari Supabase Database
async function loadOrders() {
    const tbody = document.getElementById('adminTableBody') || document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">⏳ Memuat data pesanan...</td></tr>';

    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color:#ef4444; padding: 20px;">❌ Gagal memuat data dari database.</td></tr>';
        return;
    }

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Belum ada pesanan masuk.</td></tr>';
        return;
    }

    let html = '';
    orders.forEach(o => {
        const dateStr = new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
        
        html += `
            <tr>
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
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Fungsi update status pesanan
async function updateStatus(id, newStatus) {
    const { error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        alert('❌ Gagal mengubah status pesanan.');
    } else {
        alert('✅ Status pesanan berhasil diperbarui!');
    }
}

// Panggil data saat halaman selesai di-load
window.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});