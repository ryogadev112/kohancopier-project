// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJndXB1dGNoaGdwcHlnaXB4emZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjQxNDMsImV4cCI6MjEwNDcwMDE0M30.vhd6pH6jkNsbnnZsjgonc8xGc7yk-rQIZSgegiXbmBs";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const loginSection =
    document.getElementById('loginSection');

const dashboardSection =
    document.getElementById('dashboardSection');

const loginForm =
    document.getElementById('loginForm');

const loginError =
    document.getElementById('loginError');

const btnLoginSubmit =
    document.getElementById('btnLoginSubmit');

const adminUserLabel =
    document.getElementById('adminUserLabel');


// --- CEK HAK AKSES ADMIN ---
async function checkAdminAccess() {
    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (
        sessionError ||
        !session?.user
    ) {
        showLoginForm();
        return false;
    }

    const {
        data: isAdmin,
        error: adminError
    } = await supabaseClient.rpc(
        'is_admin'
    );

    if (adminError) {
        console.error(
            'Gagal mengecek admin:',
            adminError
        );

        await supabaseClient.auth.signOut();
        showLoginForm();

        if (loginError) {
            loginError.innerText =
                "❌ Gagal memverifikasi akses admin.";

            loginError.style.display =
                'block';
        }

        return false;
    }

    if (!isAdmin) {
        await supabaseClient.auth.signOut();
        showLoginForm();

        if (loginError) {
            loginError.innerText =
                "❌ Akses ditolak. Akun ini bukan admin.";

            loginError.style.display =
                'block';
        }

        return false;
    }

    return true;
}


// --- CEK SESI LOGIN SAAT HALAMAN DIBUKA ---
window.addEventListener(
    'DOMContentLoaded',
    async () => {
        const isAdmin =
            await checkAdminAccess();

        if (isAdmin) {
            const {
                data: {
                    session
                }
            } =
                await supabaseClient.auth.getSession();

            if (session) {
                showDashboard(
                    session.user
                );
            }
        }
    }
);


function showLoginForm() {
    if (loginSection) {
        loginSection.style.display =
            'flex';
    }

    if (dashboardSection) {
        dashboardSection.style.display =
            'none';
    }
}


function showDashboard(user) {
    if (loginSection) {
        loginSection.style.display =
            'none';
    }

    if (dashboardSection) {
        dashboardSection.style.display =
            'block';
    }

    if (adminUserLabel) {
        adminUserLabel.innerText =
            `Login sebagai: ${user.email}`;
    }

    loadOrders();
}


// --- FUNGSI LOGIN SUPABASE AUTH ---
if (loginForm) {
    loginForm.addEventListener(
        'submit',
        async (e) => {
            e.preventDefault();

            loginError.style.display =
                'none';

            btnLoginSubmit.disabled =
                true;

            btnLoginSubmit.innerText =
                "⏳ Memverifikasi...";

            const email =
                document
                    .getElementById(
                        'adminEmail'
                    )
                    .value
                    .trim();

            const password =
                document
                    .getElementById(
                        'adminPassword'
                    )
                    .value;

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword(
                    {
                        email,
                        password
                    }
                );

            if (error) {
                loginError.innerText =
                    "❌ Email atau Password salah!";

                loginError.style.display =
                    'block';

                btnLoginSubmit.disabled =
                    false;

                btnLoginSubmit.innerText =
                    "Masuk ke Dasbor 🚀";

                return;
            }

            const isAdmin =
                await checkAdminAccess();

            if (!isAdmin) {
                btnLoginSubmit.disabled =
                    false;

                btnLoginSubmit.innerText =
                    "Masuk ke Dasbor 🚀";

                return;
            }

            btnLoginSubmit.disabled =
                false;

            btnLoginSubmit.innerText =
                "Masuk ke Dasbor 🚀";

            showDashboard(
                data.user
            );
        }
    );
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


// --- LOAD JSZIP UNTUK DOWNLOAD BANYAK FILE ---
let jsZipPromise = null;

function loadJSZip() {
    if (window.JSZip) {
        return Promise.resolve(
            window.JSZip
        );
    }

    if (jsZipPromise) {
        return jsZipPromise;
    }

    jsZipPromise =
        new Promise(
            (
                resolve,
                reject
            ) => {
                const script =
                    document.createElement(
                        'script'
                    );

                script.src =
                    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';

                script.onload =
                    () => {
                        if (
                            window.JSZip
                        ) {
                            resolve(
                                window.JSZip
                            );
                        } else {
                            reject(
                                new Error(
                                    'JSZip gagal dimuat.'
                                )
                            );
                        }
                    };

                script.onerror =
                    () => {
                        reject(
                            new Error(
                                'Tidak dapat memuat library ZIP.'
                            )
                        );
                    };

                document.head.appendChild(
                    script
                );
            }
        );

    return jsZipPromise;
}


// --- PARSE FILE ORDER ---
function parseOrderFiles(order) {
    if (
        Array.isArray(
            order?.files
        )
    ) {
        return order.files.filter(
            item =>
                item &&
                item.path
        );
    }

    if (
        typeof order?.files ===
        'string'
    ) {
        try {
            const parsed =
                JSON.parse(
                    order.files
                );

            if (
                Array.isArray(
                    parsed
                )
            ) {
                return parsed.filter(
                    item =>
                        item &&
                        item.path
                );
            }
        } catch (err) {
            console.warn(
                'Gagal membaca manifest files:',
                err
            );
        }
    }

    // Support order lama
    if (order?.file_url) {
        return [
            {
                path:
                    order.file_url,
                name:
                    order.file_name ||
                    order.file_url
                        .split('/')
                        .pop() ||
                    'file'
            }
        ];
    }

    return [];
}


// --- NORMALISASI STORAGE PATH ---
function getStoragePathFromValue(
    value
) {
    if (!value) {
        return null;
    }

    const marker =
        '/storage/v1/object/public/kohan-files/';

    if (
        value.includes(
            marker
        )
    ) {
        return decodeURIComponent(
            value.split(
                marker
            )[1]
        );
    }

    return value.replace(
        /^\/+/,
        ''
    );
}


// --- BUAT SIGNED URL ---
async function getSignedFileUrlFromPath(
    filePath
) {
    const normalizedPath =
        getStoragePathFromValue(
            filePath
        );

    if (!normalizedPath) {
        return null;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from(
                'kohan-files'
            )
            .createSignedUrl(
                normalizedPath,
                300
            );

    if (error) {
        console.error(
            'Gagal membuat signed URL:',
            error
        );

        return null;
    }

    return (
        data?.signedUrl ||
        null
    );
}


// --- DOWNLOAD SEMUA FILE DALAM ZIP ---
async function downloadAllOrderFiles(
    orderId,
    button
) {
    if (button) {
        button.disabled =
            true;

        button.innerText =
            '⏳ Menyiapkan ZIP...';
    }

    try {
        const {
            data: order,
            error: orderError
        } =
            await supabaseClient
                .from('orders')
                .select(
                    'id,no_antrian,nama,files,file_url,file_name'
                )
                .eq(
                    'id',
                    orderId
                )
                .single();

        if (orderError) {
            throw orderError;
        }

        const files =
            parseOrderFiles(
                order
            );

        if (!files.length) {
            alert(
                '❌ Pesanan ini tidak memiliki file.'
            );

            return;
        }

        // Kalau cuma satu file,
        // buka langsung tanpa ZIP.
        if (
            files.length === 1
        ) {
            const signedUrl =
                await getSignedFileUrlFromPath(
                    files[0].path
                );

            if (!signedUrl) {
                throw new Error(
                    'Gagal membuat akses aman ke file.'
                );
            }

            window.open(
                signedUrl,
                '_blank',
                'noopener,noreferrer'
            );

            return;
        }

        const JSZip =
            await loadJSZip();

        const zip =
            new JSZip();

        const safeQueue =
            String(
                order.no_antrian ||
                `order-${order.id}`
            ).replace(
                /[^a-zA-Z0-9_-]/g,
                '_'
            );

        let downloadedCount =
            0;

        for (
            let i = 0;
            i < files.length;
            i++
        ) {
            const item =
                files[i];

            const signedUrl =
                await getSignedFileUrlFromPath(
                    item.path
                );

            if (!signedUrl) {
                console.warn(
                    'File dilewati karena signed URL gagal:',
                    item
                );

                continue;
            }

            const response =
                await fetch(
                    signedUrl
                );

            if (
                !response.ok
            ) {
                console.warn(
                    'File gagal diambil:',
                    item.name,
                    response.status
                );

                continue;
            }

            const blob =
                await response.blob();

            const fileName =
                item.name ||
                `file-${i + 1}`;

            zip.file(
                fileName,
                blob
            );

            downloadedCount++;

            if (button) {
                button.innerText =
                    `⏳ ${downloadedCount}/${files.length}...`;
            }
        }

        if (
            downloadedCount ===
            0
        ) {
            throw new Error(
                'Tidak ada file yang berhasil diambil.'
            );
        }

        const zipBlob =
            await zip.generateAsync(
                {
                    type: 'blob',
                    compression:
                        'DEFLATE',
                    compressionOptions:
                        {
                            level: 6
                        }
                }
            );

        const objectUrl =
            URL.createObjectURL(
                zipBlob
            );

        const link =
            document.createElement(
                'a'
            );

        link.href =
            objectUrl;

        link.download =
            `${safeQueue}.zip`;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(
            () => {
                URL.revokeObjectURL(
                    objectUrl
                );
            },
            1500
        );

        if (
            downloadedCount <
            files.length
        ) {
            alert(
                `⚠️ ZIP berhasil dibuat, tetapi ${
                    files.length -
                    downloadedCount
                } file gagal diambil.`
            );
        }

    } catch (err) {
        console.error(
            'Gagal download semua file:',
            err
        );

        alert(
            '❌ Gagal membuat ZIP: ' +
            err.message
        );

    } finally {
        if (button) {
            button.disabled =
                false;

            button.innerText =
                '📦 Download Semua';
        }
    }
}


// --- BUKA / DOWNLOAD SATU FILE PESANAN ---
async function downloadOrderFile(
    fileUrl
) {
    if (!fileUrl) {
        alert(
            '❌ File tidak tersedia.'
        );

        return;
    }

    const button =
        event?.currentTarget;

    if (button) {
        button.disabled =
            true;

        button.innerText =
            "⏳ Menyiapkan...";
    }

    try {
        const signedUrl =
            await getSignedFileUrlFromPath(
                fileUrl
            );

        if (!signedUrl) {
            alert(
                '❌ Gagal membuat akses aman ke file.'
            );

            return;
        }

        window.open(
            signedUrl,
            '_blank',
            'noopener,noreferrer'
        );

    } catch (err) {
        console.error(
            err
        );

        alert(
            '❌ Gagal membuka file: ' +
            err.message
        );

    } finally {
        if (button) {
            button.disabled =
                false;

            button.innerText =
                "📥 Download File";
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
    } =
        await supabaseClient
            .from('orders')
            .select('*')
            .order(
                'id',
                {
                    ascending:
                        false
                }
            );

    if (error) {
        console.error(
            'Gagal memuat orders:',
            error
        );

        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align: center; color:#ef4444; padding: 20px;">❌ Gagal memuat data dari database.</td></tr>';

        return;
    }

    if (
        !orders ||
        orders.length === 0
    ) {
        tbody.innerHTML =
            '<tr><td colspan="10" style="text-align: center; padding: 20px;">Belum ada pesanan masuk.</td></tr>';

        return;
    }

    let html =
        '';

    orders.forEach(
        o => {
            const dateStr =
                new Date(
                    o.created_at
                ).toLocaleString(
                    'id-ID',
                    {
                        dateStyle:
                            'short',
                        timeStyle:
                            'short'
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
                        ${
                            o.no_antrian ||
                            '-'
                        }
                    </td>

                    <td style="
                        font-size: 12px;
                        color: var(--text-muted);
                    ">
                        ${dateStr}
                    </td>

                    <td>
                        <b>
                            ${o.nama}
                        </b><br>

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
                        ${
                            o.catatan ||
                            '-'
                        }
                    </td>

                    <td style="
                        color: var(--primary);
                        font-weight: bold;
                    ">
                        ${
                            o.waktu_ambil
                        }
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
                        ${
                            (() => {
                                const fileList =
                                    parseOrderFiles(
                                        o
                                    );

                                const fileCount =
                                    fileList.length;

                                if (
                                    !fileCount
                                ) {
                                    return `
                                        <span style="
                                            color:var(--text-muted);
                                        ">
                                            Tanpa File
                                        </span>
                                    `;
                                }

                                if (
                                    fileCount ===
                                    1
                                ) {
                                    const firstFile =
                                        fileList[0];

                                    const safePath =
                                        String(
                                            firstFile.path ||
                                            ''
                                        )
                                            .replace(
                                                /\\/g,
                                                '\\\\'
                                            )
                                            .replace(
                                                /'/g,
                                                "\\'"
                                            );

                                    return `
                                        <button
                                            type="button"
                                            onclick="downloadOrderFile('${safePath}')"
                                            style="
                                                padding:8px 12px;
                                                background:#16a34a;
                                                color:white;
                                                border:none;
                                                border-radius:6px;
                                                font-weight:bold;
                                                font-size:12px;
                                                cursor:pointer;
                                            "
                                        >
                                            📥 Download File
                                        </button>
                                    `;
                                }

                                return `
                                    <button
                                        type="button"
                                        onclick="downloadAllOrderFiles(
                                            ${o.id},
                                            this
                                        )"
                                        style="
                                            padding:8px 12px;
                                            background:#16a34a;
                                            color:white;
                                            border:none;
                                            border-radius:6px;
                                            font-weight:bold;
                                            font-size:12px;
                                            cursor:pointer;
                                        "
                                    >
                                        📦 Download Semua (${fileCount})
                                    </button>
                                `;
                            })()
                        }
                    </td>

                    <td>
                        <select
                            onchange="updateStatus(
                                ${o.id},
                                this.value
                            )"
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
        }
    );

    tbody.innerHTML =
        html;
}


// --- FUNGSI UPDATE STATUS PESANAN ---
async function updateStatus(
    id,
    newStatus
) {
    const {
        error
    } =
        await supabaseClient
            .from('orders')
            .update({
                status:
                    newStatus
            })
            .eq(
                'id',
                id
            );

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
        } =
            await supabaseClient
                .from('orders')
                .delete()
                .eq(
                    'id',
                    id
                );

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