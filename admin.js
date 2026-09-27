// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_s_pTEbz1PXq9byGJu14RCw_ppa1gtlH";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLoginSubmit = document.getElementById('btnLoginSubmit');
const adminUserLabel = document.getElementById('adminUserLabel');

let adminOrdersCache = new Map();
let jsZipLoadPromise = null;


// --- CEK HAK AKSES ADMIN ---
async function checkAdminAccess() {
    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
        showLoginForm();
        return false;
    }

    const {
        data: isAdmin,
        error: adminError
    } = await supabaseClient.rpc('is_admin');

    if (adminError) {
        console.error('Gagal mengecek admin:', adminError);

        await supabaseClient.auth.signOut();
        showLoginForm();

        if (loginError) {
            loginError.innerText =
                "❌ Gagal memverifikasi akses admin.";
            loginError.style.display = 'block';
        }

        return false;
    }

    if (!isAdmin) {
        await supabaseClient.auth.signOut();
        showLoginForm();

        if (loginError) {
            loginError.innerText =
                "❌ Akses ditolak. Akun ini bukan admin.";
            loginError.style.display = 'block';
        }

        return false;
    }

    return true;
}


// --- CEK SESI LOGIN SAAT HALAMAN DIBUKA ---
window.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await checkAdminAccess();

    if (isAdmin) {
        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (session) {
            showDashboard(session.user);
        }
    }
});


function showLoginForm() {
    if (loginSection) {
        loginSection.style.display = 'flex';
    }

    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
}


function showDashboard(user) {
    if (loginSection) {
        loginSection.style.display = 'none';
    }

    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }

    if (adminUserLabel) {
        adminUserLabel.innerText =
            `Login sebagai: ${user.email}`;
    }

    loadOrders();
}


// --- FUNGSI LOGIN SUPABASE AUTH ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        loginError.style.display = 'none';

        btnLoginSubmit.disabled = true;
        btnLoginSubmit.innerText = "⏳ Memverifikasi...";

        const email =
            document.getElementById('adminEmail').value.trim();

        const password =
            document.getElementById('adminPassword').value;

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Supabase login error:", error);

            loginError.innerText =
                `❌ ${error.message || "Email atau Password salah!"}`;

            loginError.style.display = 'block';

            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerText =
                "Masuk ke Dasbor 🚀";

            return;
        }

        // Login berhasil, sekarang cek apakah benar-benar admin
        const isAdmin = await checkAdminAccess();

        if (!isAdmin) {
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerText =
                "Masuk ke Dasbor 🚀";

            return;
        }

        btnLoginSubmit.disabled = false;
        btnLoginSubmit.innerText =
            "Masuk ke Dasbor 🚀";

        showDashboard(data.user);
    });
}


// --- FUNGSI LOGOUT ---
async function logoutAdmin() {
    if (
        confirm(
            "Apakah Anda yakin ingin keluar dari Dashboard Admin?"
        )
    ) {
        await supabaseClient.auth.signOut();
        showLoginForm();
    }
}


// --- FILE DOWNLOAD HELPERS ---
function extractStoragePath(fileUrl) {
    if (!fileUrl) return null;

    const marker =
        '/storage/v1/object/public/kohan-files/';

    if (fileUrl.includes(marker)) {
        return decodeURIComponent(
            fileUrl.split(marker)[1]
        );
    }

    return fileUrl;
}


async function getSignedFileUrl(filePathOrUrl) {
    const filePath =
        extractStoragePath(filePathOrUrl);

    if (!filePath) return null;

    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from('kohan-files')
        .createSignedUrl(filePath, 300);

    if (error) {
        console.error(
            'Gagal membuat signed URL:',
            error
        );

        return null;
    }

    return data?.signedUrl || null;
}


function getOrderFiles(order) {
    if (
        Array.isArray(order?.files) &&
        order.files.length
    ) {
        return order.files
            .filter(
                file =>
                    file &&
                    (file.path || file.url)
            )
            .map((file, index) => ({
                path:
                    file.path ||
                    file.url,

                name:
                    file.name ||
                    `file-${index + 1}`
            }));
    }

    if (order?.file_url) {
        return [{
            path: order.file_url,
            name:
                order.file_name ||
                'file'
        }];
    }

    return [];
}


async function ensureJSZip() {
    if (window.JSZip) {
        return window.JSZip;
    }

    if (jsZipLoadPromise) {
        return jsZipLoadPromise;
    }

    jsZipLoadPromise = new Promise(
        (resolve, reject) => {
            const existing =
                document.querySelector(
                    'script[data-kohan-jszip]'
                );

            if (existing) {
                existing.addEventListener(
                    'load',
                    () => resolve(window.JSZip)
                );

                existing.addEventListener(
                    'error',
                    reject
                );

                return;
            }

            const script =
                document.createElement('script');

            script.src =
                'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

            script.async = true;

            script.dataset.kohanJszip =
                'true';

            script.onload = () => {
                if (window.JSZip) {
                    resolve(window.JSZip);
                } else {
                    reject(
                        new Error(
                            'JSZip tidak tersedia.'
                        )
                    );
                }
            };

            script.onerror = () => {
                reject(
                    new Error(
                        'Gagal memuat modul ZIP.'
                    )
                );
            };

            document.head.appendChild(script);
        }
    );

    try {
        return await jsZipLoadPromise;
    } finally {
        jsZipLoadPromise = null;
    }
}


async function downloadOrderFile(fileUrl) {
    const signedUrl =
        await getSignedFileUrl(fileUrl);

    if (!signedUrl) {
        alert(
            '❌ Gagal membuat akses aman ke file.'
        );

        return;
    }

    const anchor =
        document.createElement('a');

    anchor.href = signedUrl;
    anchor.target = '_blank';
    anchor.rel =
        'noopener noreferrer';

    anchor.click();
}


async function downloadAllOrderFiles(orderId) {
    const order =
        adminOrdersCache.get(
            String(orderId)
        ) ||
        adminOrdersCache.get(orderId);

    if (!order) {
        alert(
            '❌ Data pesanan tidak ditemukan.'
        );

        return;
    }

    const files =
        getOrderFiles(order);

    if (!files.length) {
        alert(
            '❌ Pesanan ini tidak memiliki file.'
        );

        return;
    }

    const button =
        document.querySelector(
            `[data-download-order="${orderId}"]`
        );

    const originalText =
        button?.innerText ||
        '📥 Download File';

    if (button) {
        button.disabled = true;
        button.innerText =
            '⏳ Menyiapkan...';
    }

    try {

        // Satu file: download langsung
        if (files.length === 1) {
            const signedUrl =
                await getSignedFileUrl(
                    files[0].path
                );

            if (!signedUrl) {
                throw new Error(
                    'Gagal membuat akses aman ke file.'
                );
            }

            const anchor =
                document.createElement('a');

            anchor.href = signedUrl;

            anchor.download =
                files[0].name ||
                'file';

            anchor.target = '_blank';

            anchor.rel =
                'noopener noreferrer';

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            return;
        }

        // Banyak file: ZIP
        const JSZip =
            await ensureJSZip();

        const zip =
            new JSZip();

        let downloadedCount = 0;

        for (const file of files) {
            const signedUrl =
                await getSignedFileUrl(
                    file.path
                );

            if (!signedUrl) {
                throw new Error(
                    `Gagal mengakses ${file.name || 'file'}.`
                );
            }

            const response =
                await fetch(signedUrl);

            if (!response.ok) {
                throw new Error(
                    `Gagal mengunduh ${file.name || 'file'}.`
                );
            }

            const blob =
                await response.blob();

            zip.file(
                file.name ||
                `file-${downloadedCount + 1}`,
                blob
            );

            downloadedCount++;
        }

        const zipBlob =
            await zip.generateAsync({
                type: 'blob'
            });

        const url =
            URL.createObjectURL(
                zipBlob
            );

        const anchor =
            document.createElement('a');

        anchor.href = url;

        anchor.download =
            `${order.no_antrian || `order-${order.id}`}.zip`;

        document.body.appendChild(anchor);

        anchor.click();

        anchor.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );

        alert(
            `✅ ${downloadedCount} file berhasil dikemas dan didownload.`
        );

    } catch (err) {
        console.error(err);

        alert(
            '❌ Gagal download semua file: ' +
            err.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.innerText =
                originalText;
        }
    }
}


// --- MEMUAT DATA PESANAN DARI SUPABASE ---
async function loadOrders() {
    const tbody =
        document.getElementById(
            'adminTableBody'
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML =
        '<tr><td colspan="10" style="text-align: center; padding: 20px;">⏳ Memuat data pesanan...</td></tr>';

    const {
        data: orders,
        error
    } = await supabaseClient
        .from('orders')
        .select('*')
        .order('id', {
            ascending: false
        });

    if (error) {
        console.error(
            'Gagal memuat orders:',
            error
        );

        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align: center; color:#ef4444; padding: 20px;">❌ Gagal memuat data dari database.</td></tr>';

        return;
    }

    adminOrdersCache =
        new Map(
            (orders || []).map(
                order => [
                    String(order.id),
                    order
                ]
            )
        );

    if (
        !orders ||
        orders.length === 0
    ) {
        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align: center; padding: 20px;">Belum ada pesanan masuk.</td></tr>';

        return;
    }

    let html = '';

    orders.forEach(o => {

        const dateStr =
            new Date(
                o.created_at
            ).toLocaleString(
                'id-ID',
                {
                    dateStyle: 'short',
                    timeStyle: 'short'
                }
            );

        const isSafeToDelete =
            o.status.includes(
                'SELESAI'
            ) ||
            o.status.includes(
                'SIAP'
            );

        html += `
            <tr>

                <td style="
                    font-weight: bold;
                    color: var(--primary);
                    font-size: 15px;
                ">
                    ${o.no_antrian || '-'}
                </td>

                <td style="
                    font-size: 12px;
                    color: var(--text-muted);
                ">
                    ${dateStr}
                </td>

                <td>
                    <b>${o.nama}</b><br>

                    <span style="
                        font-size: 12px;
                        color: var(--text-muted);
                    ">
                        ${o.phone}
                    </span><br>

                    <a
                        href="https://wa.me/${o.phone}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            display:inline-block;
                            margin-top:4px;
                            padding:2px 8px;
                            background:#22c55e;
                            color:white;
                            border-radius:4px;
                            text-decoration:none;
                            font-size:11px;
                            font-weight:bold;
                        "
                    >
                        📱 Chat WA
                    </a>
                </td>

                <td>
                    ${o.detail_cetak}
                </td>

                <td style="
                    font-style: italic;
                    color: var(--text-muted);
                ">
                    ${o.catatan || '-'}
                </td>

                <td style="
                    color: var(--primary);
                    font-weight: bold;
                ">
                    ${o.waktu_ambil}
                </td>

                <td style="
                    color: #16a34a;
                    font-weight: bold;
                ">
                    Rp ${
                        Number(
                            o.total_harga
                        ).toLocaleString(
                            'id-ID'
                        )
                    }
                </td>

                <td>
                    ${(() => {

                        const fileCount =
                            getOrderFiles(o)
                                .length;

                        return fileCount
                            ? `
                                <button
                                    type="button"
                                    data-download-order="${o.id}"
                                    onclick="downloadAllOrderFiles(${o.id})"
                                    style="
                                        padding:6px 12px;
                                        background:#16a34a;
                                        color:white;
                                        border:none;
                                        border-radius:6px;
                                        font-weight:bold;
                                        font-size:12px;
                                        cursor:pointer;
                                    "
                                    title="Download semua file pesanan"
                                >
                                    📥 ${
                                        fileCount > 1
                                            ? `Download Semua (${fileCount})`
                                            : 'Download File'
                                    }
                                </button>
                              `
                            : `
                                <span style="color:var(--text-muted);">
                                    Tanpa File
                                </span>
                              `;

                    })()}
                </td>

                <td>
                    <select
                        onchange="updateStatus(${o.id}, this.value)"
                        style="
                            padding:6px;
                            border-radius:6px;
                            background:var(--input-bg);
                            color:var(--text-main);
                            border:1px solid var(--border-color);
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >

                        <option
                            value="Menunggu Pembayaran (UNPAID)"
                            ${
                                o.status.includes(
                                    'UNPAID'
                                )
                                    ? 'selected'
                                    : ''
                            }
                        >
                            ⏳ UNPAID
                        </option>

                        <option
                            value="🖨️ DIPROSES"
                            ${
                                o.status.includes(
                                    'DIPROSES'
                                )
                                    ? 'selected'
                                    : ''
                            }
                        >
                            🖨️ DIPROSES
                        </option>

                        <option
                            value="✅ SIAP DIAMBIL"
                            ${
                                o.status.includes(
                                    'SIAP'
                                )
                                    ? 'selected'
                                    : ''
                            }
                        >
                            ✅ SIAP DIAMBIL
                        </option>

                        <option
                            value="🎉 SELESAI"
                            ${
                                o.status.includes(
                                    'SELESAI'
                                )
                                    ? 'selected'
                                    : ''
                            }
                        >
                            🎉 SELESAI
                        </option>

                    </select>
                </td>

                <td>
                    <button
                        onclick="deleteOrder(
                            ${o.id},
                            '${o.status.replace(
                                /'/g,
                                "\\'"
                            )}'
                        )"
                        style="
                            padding:6px 12px;
                            border-radius:6px;
                            border:none;
                            font-weight:bold;
                            font-size:12px;
                            cursor:${
                                isSafeToDelete
                                    ? 'pointer'
                                    : 'not-allowed'
                            };
                            background:${
                                isSafeToDelete
                                    ? '#dc2626'
                                    : '#94a3b8'
                            };
                            color:white;
                        "
                        title="${
                            isSafeToDelete
                                ? 'Hapus Pesanan'
                                : 'Ubah status ke SIAP DIAMBIL / SELESAI untuk menghapus'
                        }"
                    >
                        🗑️ Hapus
                    </button>
                </td>

            </tr>
        `;
    });

    tbody.innerHTML = html;
}


// --- FUNGSI UPDATE STATUS PESANAN ---
async function updateStatus(
    id,
    newStatus
) {
    const {
        error
    } = await supabaseClient
        .from('orders')
        .update({
            status: newStatus
        })
        .eq('id', id);

    if (error) {
        console.error(
            'Gagal update status:',
            error
        );

        alert(
            '❌ Gagal mengubah status pesanan.'
        );

    } else {
        loadOrders();
    }
}


// --- FUNGSI HAPUS PESANAN ---
async function deleteOrder(
    id,
    status
) {
    const isSafe =
        status.includes(
            'SELESAI'
        ) ||
        status.includes(
            'SIAP'
        );

    if (!isSafe) {
        alert(
            '⚠️ Pesanan tidak dapat dihapus!\n\n' +
            'Untuk alasan keamanan, ubah status pesanan menjadi ' +
            '"✅ SIAP DIAMBIL" atau "🎉 SELESAI" terlebih dahulu ' +
            'sebelum menghapus.'
        );

        return;
    }

    if (
        confirm(
            '⚠️ Apakah Anda yakin ingin menghapus pesanan ini secara permanen? ' +
            'Data yang dihapus tidak bisa dikembalikan.'
        )
    ) {

        const {
            error
        } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            alert(
                '❌ Gagal menghapus pesanan: ' +
                error.message
            );

        } else {
            alert(
                '✅ Pesanan berhasil dihapus.'
            );

            loadOrders();
        }
    }
}