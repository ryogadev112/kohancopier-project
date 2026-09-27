// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://gputfcshhgppygipxzfh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdXRmY3NoaGdwcHln aXB4emZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjQxNDMsImV4cCI6MjEwNDcwMDE0M30.vhd6pH6jkNsbnnZsjgonc8xGc7yk-rQIZSgegiXbmBs";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const ADMIN_WA = "6285316121981";

const MAX_FILES_PER_ORDER = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 50 * 1024 * 1024;


// --- CEK STATUS TOKO LIVE ---
function checkLiveStoreStatus() {
    const badge = document.getElementById('liveStoreBadge');
    if (!badge) return;

    const now = new Date();
    const day = now.getDay();
    const currentHour =
        now.getHours() +
        now.getMinutes() / 60;

    const jamBukaToko = {
        0: { buka: 0, tutup: 0, libur: true },
        1: { buka: 6, tutup: 17, libur: false },
        2: { buka: 9, tutup: 18, libur: false },
        3: { buka: 9, tutup: 18, libur: false },
        4: { buka: 6, tutup: 17, libur: false },
        5: { buka: 6, tutup: 17, libur: false },
        6: { buka: 7, tutup: 12, libur: false }
    };

    const hariIni = jamBukaToko[day];

    let isOpen = false;

    if (
        !hariIni.libur &&
        currentHour >= hariIni.buka &&
        currentHour < hariIni.tutup
    ) {
        isOpen = true;
    }

    if (isOpen) {
        badge.className = "store-badge open";
        badge.innerHTML = "🟢 Toko Buka";
    } else {
        badge.className = "store-badge closed";
        badge.innerHTML = "🔴 Toko Tutup";
    }
}


// --- GENERATE SLOT WAKTU AMBIL ---
function generateJadwalAmbil() {
    const selectAmbil =
        document.getElementById('waktuAmbil');

    const infoJamBuka =
        document.getElementById('infoJamBuka');

    if (!selectAmbil) return;

    selectAmbil.innerHTML = '';

    const now = new Date();

    const day = now.getDay();

    const currentHour =
        now.getHours() +
        now.getMinutes() / 60;

    const jamBukaToko = {
        0: {
            nama: 'Minggu',
            buka: 0,
            tutup: 0,
            libur: true
        },

        1: {
            nama: 'Senin',
            buka: 6,
            tutup: 17,
            libur: false
        },

        2: {
            nama: 'Selasa',
            buka: 9,
            tutup: 18,
            libur: false
        },

        3: {
            nama: 'Rabu',
            buka: 9,
            tutup: 18,
            libur: false
        },

        4: {
            nama: 'Kamis',
            buka: 6,
            tutup: 17,
            libur: false
        },

        5: {
            nama: 'Jumat',
            buka: 6,
            tutup: 17,
            libur: false
        },

        6: {
            nama: 'Sabtu',
            buka: 7,
            tutup: 12,
            libur: false
        }
    };

    const hariIni = jamBukaToko[day];

    let optionsHtml = '';

    if (
        hariIni.libur ||
        currentHour >= hariIni.tutup
    ) {
        if (infoJamBuka) {
            infoJamBuka.innerText =
                `⚠️ Toko ${
                    hariIni.libur
                        ? 'libur (Minggu)'
                        : 'sudah tutup hari ini'
                }. Pesanan akan disiapkan untuk hari berikutnya.`;
        }

        optionsHtml += `
            <option value="Besok (Hari Buka) - Jam Operasional">
                Besok (Sesuai Jam Buka Toko)
            </option>
        `;
    } else {
        if (infoJamBuka) {
            infoJamBuka.innerText =
                `ℹ️ Jam Operasional Hari Ini (${hariIni.nama}): ${
                    String(hariIni.buka).padStart(2, '0')
                }.00 – ${
                    String(hariIni.tutup).padStart(2, '0')
                }.00 WIB`;
        }

        optionsHtml += `
            <option value="Hari ini - Secepatnya (Sesuai Antrean)">
                Hari ini - Secepatnya (Sesuai Antrean)
            </option>
        `;

        if (
            hariIni.tutup > 12 &&
            currentHour < 12
        ) {
            optionsHtml += `
                <option value="Hari ini - Siang (12:00 - 15:00)">
                    Hari ini - Siang (12:00 - 15:00)
                </option>
            `;
        }

        if (
            hariIni.tutup > 15 &&
            currentHour < 15
        ) {
            optionsHtml += `
                <option value="Hari ini - Sore (15:00 - ${
                    String(hariIni.tutup).padStart(2, '0')
                }:00)">
                    Hari ini - Sore (15:00 - ${
                        String(hariIni.tutup).padStart(2, '0')
                    }:00)
                </option>
            `;
        }

        optionsHtml += `
            <option value="Besok Pagi">
                Besok Pagi
            </option>
        `;
    }

    selectAmbil.innerHTML = optionsHtml;
}


window.addEventListener('DOMContentLoaded', () => {
    checkLiveStoreStatus();
    generateJadwalAmbil();
    updatePrice();
    loadFeedbackList();
});


// --- FORM HANDLER & PRICING ---

const kategoriLayanan =
    document.getElementById('kategoriLayanan');

const sectionDokumen =
    document.getElementById('sectionDokumen');

const sectionStiker =
    document.getElementById('sectionStiker');

const fileLabel =
    document.getElementById('fileLabel');

const fileHelper =
    document.getElementById('fileHelper');

const fileInput =
    document.getElementById('file');

const jenisStikerSelect =
    document.getElementById('jenisStiker');

const jumlahLembarStikerInput =
    document.getElementById('jumlahLembarStiker');

const ukuranKertasSelect =
    document.getElementById('ukuranKertas');

const groupCustomUkuran =
    document.getElementById('groupCustomUkuran');

const jumlahHalamanInput =
    document.getElementById('jumlahHalaman');

const jumlahCopyInput =
    document.getElementById('jumlahCopy');

const pricePreview =
    document.getElementById('pricePreview');


function handleKategoriChange() {
    if (!kategoriLayanan) return;

    if (kategoriLayanan.value === 'stiker') {
        if (sectionDokumen) {
            sectionDokumen.style.display = 'none';
        }

        if (sectionStiker) {
            sectionStiker.style.display = 'block';
        }

        if (fileLabel) {
            fileLabel.innerText =
                "Upload File Desain Stiker (PNG/JPG/CDR/PDF) *";
        }

        if (fileHelper) {
            fileHelper.innerHTML =
                "💡 <b>Tips Stiker:</b> Gunakan file resolusi tinggi (PNG transparan/CDR/PDF). Maksimal 10MB.";
        }
    } else {
        if (sectionDokumen) {
            sectionDokumen.style.display = 'block';
        }

        if (sectionStiker) {
            sectionStiker.style.display = 'none';
        }

        if (fileLabel) {
            fileLabel.innerText =
                "Upload File Dokumen (PDF/DOCX) *";
        }

        if (fileHelper) {
            fileHelper.innerHTML =
                "Format: PDF (Auto-deteksi halaman), DOCX. Maksimal 10MB.";
        }
    }

    updatePrice();
}


if (kategoriLayanan) {
    kategoriLayanan.addEventListener(
        'change',
        handleKategoriChange
    );
}


if (ukuranKertasSelect) {
    ukuranKertasSelect.addEventListener(
        'change',
        () => {
            if (groupCustomUkuran) {
                groupCustomUkuran.style.display =
                    ukuranKertasSelect.value === 'Custom'
                        ? 'block'
                        : 'none';
            }

            updatePrice();
        }
    );
}


if (jenisStikerSelect) {
    jenisStikerSelect.addEventListener(
        'change',
        () => {
            const labelJumlah =
                document.getElementById(
                    'labelJumlahStiker'
                );

            if (labelJumlah) {
                labelJumlah.innerText =
                    jenisStikerSelect.value === 'Roll'
                        ? "Panjang Stiker (dalam Meter) *"
                        : "Jumlah Lembar A3+ *";
            }

            updatePrice();
        }
    );
}


// --- VALIDASI & DETEKSI HALAMAN MULTI-FILE ---

function formatBytes(bytes) {
    if (bytes < 1024 * 1024) {
        return `${Math.max(
            1,
            Math.round(bytes / 1024)
        )} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


function renderSelectedFiles(files) {
    const fileList =
        document.getElementById('fileList');

    if (!fileList) return;

    if (!files.length) {
        fileList.style.display = 'none';
        fileList.innerHTML = '';
        return;
    }

    fileList.style.display = 'block';

    fileList.innerHTML =
        files
            .map(
                (file, index) => `
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        padding:5px 0;
                        border-bottom:${
                            index < files.length - 1
                                ? '1px solid var(--border-color)'
                                : 'none'
                        };
                    ">
                        <span style="
                            font-weight:700;
                            color:var(--primary);
                        ">
                            ${index + 1}.
                        </span>

                        <span style="
                            flex:1;
                            word-break:break-word;
                        ">
                            ${file.name}
                        </span>

                        <span style="
                            color:var(--text-muted);
                            white-space:nowrap;
                        ">
                            ${formatBytes(file.size)}
                        </span>
                    </div>
                `
            )
            .join('');
}


if (fileInput) {
    fileInput.addEventListener(
        'change',
        async function () {
            const files =
                Array.from(this.files || []);

            if (!files.length) {
                renderSelectedFiles([]);

                if (fileHelper) {
                    fileHelper.innerHTML =
                        'Bisa pilih beberapa file sekaligus. Maks. 10 file, 10MB/file, total 50MB.';
                }

                return;
            }

            if (
                files.length >
                MAX_FILES_PER_ORDER
            ) {
                alert(
                    `❌ Maksimal ${MAX_FILES_PER_ORDER} file per pesanan.`
                );

                this.value = '';

                renderSelectedFiles([]);

                return;
            }

            const totalBytes =
                files.reduce(
                    (sum, file) =>
                        sum + file.size,
                    0
                );

            const oversized =
                files.find(
                    file =>
                        file.size >
                        MAX_FILE_SIZE_BYTES
                );

            if (oversized) {
                alert(
                    `❌ File "${oversized.name}" lebih dari 10MB.`
                );

                this.value = '';

                renderSelectedFiles([]);

                return;
            }

            if (
                totalBytes >
                MAX_TOTAL_UPLOAD_BYTES
            ) {
                alert(
                    '❌ Total ukuran semua file maksimal 50MB per pesanan.'
                );

                this.value = '';

                renderSelectedFiles([]);

                return;
            }

            renderSelectedFiles(files);

            let detectedPages = 0;
            let pdfCount = 0;
            let hasPdfError = false;

            for (const file of files) {
                const isPdf =
                    file.type ===
                        'application/pdf' ||
                    /\.pdf$/i.test(
                        file.name
                    );

                if (isPdf) {
                    pdfCount++;

                    try {
                        const arrayBuffer =
                            await file.arrayBuffer();

                        const pdf =
                            await pdfjsLib
                                .getDocument({
                                    data: arrayBuffer
                                })
                                .promise;

                        detectedPages +=
                            pdf.numPages;
                    } catch (err) {
                        hasPdfError = true;
                        detectedPages += 1;
                    }
                } else {
                    detectedPages += 1;
                }
            }

            if (jumlahHalamanInput) {
                jumlahHalamanInput.value =
                    Math.max(
                        1,
                        detectedPages
                    );

                updatePrice();
            }

            if (fileHelper) {
                if (
                    pdfCount > 0 &&
                    !hasPdfError
                ) {
                    fileHelper.innerHTML =
                        `✅ <span style="color:#16a34a;font-weight:bold;">${files.length} file siap diupload (${detectedPages} halaman terdeteksi)</span>`;
                } else {
                    fileHelper.innerHTML =
                        `✅ <span style="color:#16a34a;font-weight:bold;">${files.length} file siap diupload</span>`;
                }
            }
        }
    );
}


// --- FUNGSI UTAMA KALKULASI HARGA ---

function updatePrice() {
    const kategori =
        kategoriLayanan
            ? kategoriLayanan.value
            : 'dokumen';

    let total = 0;

    if (kategori === 'stiker') {
        const jenisStiker =
            jenisStikerSelect
                ? jenisStikerSelect.value
                : 'Vinyl';

        const jumlah =
            parseInt(
                jumlahLembarStikerInput
                    ? jumlahLembarStikerInput.value
                    : 1
            ) || 1;

        let hargaSatuan = 25000;

        if (jenisStiker === 'Kromo') {
            hargaSatuan = 15000;
        } else if (
            jenisStiker === 'Roll'
        ) {
            hargaSatuan = 50000;
        }

        const finishing =
            document.getElementById(
                'finishingStiker'
            )?.value ||
            'Tanpa Potong';

        const finishingMultiplier =
            finishing === 'Tanpa Potong'
                ? 0.8
                : (
                    finishing === 'Die Cut'
                        ? 1.2
                        : 1.1
                );

        total =
            jumlah *
            hargaSatuan *
            finishingMultiplier;

    } else {
        const hal =
            parseInt(
                jumlahHalamanInput
                    ? jumlahHalamanInput.value
                    : 1
            ) || 1;

        const copy =
            parseInt(
                jumlahCopyInput
                    ? jumlahCopyInput.value
                    : 1
            ) || 1;

        const checkedRadio =
            document.querySelector(
                'input[name="jenisCetak"]:checked'
            );

        const jenis =
            checkedRadio
                ? checkedRadio.value
                : 'Hitam Putih';

        const ukuranKertas =
            ukuranKertasSelect
                ? ukuranKertasSelect.value
                : 'A4';

        let hargaPerHal =
            jenis === 'Warna'
                ? 2000
                : 1000;

        if (
            ukuranKertas === 'A3+'
        ) {
            hargaPerHal *= 2;
        }

        total =
            hal *
            copy *
            hargaPerHal;
    }

    if (pricePreview) {
        pricePreview.innerText =
            "Rp " +
            total.toLocaleString(
                'id-ID'
            );
    }
}


if (jumlahHalamanInput) {
    jumlahHalamanInput.addEventListener(
        'input',
        updatePrice
    );
}


if (jumlahCopyInput) {
    jumlahCopyInput.addEventListener(
        'input',
        updatePrice
    );
}


if (jumlahLembarStikerInput) {
    jumlahLembarStikerInput.addEventListener(
        'input',
        updatePrice
    );
}


const finishingStikerSelect =
    document.getElementById(
        'finishingStiker'
    );


if (finishingStikerSelect) {
    finishingStikerSelect.addEventListener(
        'change',
        updatePrice
    );
}


document.addEventListener(
    'change',
    e => {
        if (
            e.target &&
            e.target.name ===
                'jenisCetak'
        ) {
            updatePrice();
        }
    }
);


// --- TIMER INVOICE ---

let countdownInterval;


function startInvoiceTimer(
    durationInSeconds
) {
    clearInterval(
        countdownInterval
    );

    let timer =
        durationInSeconds;

    const timerDisplay =
        document.getElementById(
            'invoiceTimer'
        );

    countdownInterval =
        setInterval(
            () => {
                let minutes =
                    parseInt(
                        timer / 60,
                        10
                    );

                let seconds =
                    parseInt(
                        timer % 60,
                        10
                    );

                minutes =
                    minutes < 10
                        ? "0" + minutes
                        : minutes;

                seconds =
                    seconds < 10
                        ? "0" + seconds
                        : seconds;

                if (timerDisplay) {
                    timerDisplay.innerText =
                        "⏱️ " +
                        minutes +
                        ":" +
                        seconds;
                }

                if (--timer < 0) {
                    clearInterval(
                        countdownInterval
                    );

                    if (timerDisplay) {
                        timerDisplay.innerText =
                            "⏱️ Waktu Habis!";
                    }
                }
            },
            1000
        );
}


// --- VERIFIKASI STATUS SISWA ---

const phoneInput =
    document.getElementById(
        'phone'
    );

const btnCheckStudent =
    document.getElementById(
        'btnCheckStudent'
    );

const btnApplyStudent =
    document.getElementById(
        'btnApplyStudent'
    );

const studentVerificationStatus =
    document.getElementById(
        'studentVerificationStatus'
    );

const paymentMethodGroup =
    document.getElementById(
        'paymentMethodGroup'
    );


function getSelectedPaymentMethod() {
    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected
        ? selected.value
        : 'QRIS';
}


function resetStudentVerificationUI() {
    if (studentVerificationStatus) {
        studentVerificationStatus.innerText =
            '🎓 Status siswa: belum dicek.';

        studentVerificationStatus.style.color =
            'var(--text-muted)';
    }

    if (btnApplyStudent) {
        btnApplyStudent.style.display =
            'none';
    }

    if (paymentMethodGroup) {
        paymentMethodGroup.style.display =
            'none';
    }

    const qrisRadio =
        document.querySelector(
            'input[name="paymentMethod"][value="QRIS"]'
        );

    if (qrisRadio) {
        qrisRadio.checked = true;
    }
}


async function checkStudentStatus() {
    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : '';

    if (!phone) {
        alert(
            '❌ Masukkan nomor WhatsApp terlebih dahulu.'
        );

        return;
    }

    if (btnCheckStudent) {
        btnCheckStudent.disabled =
            true;

        btnCheckStudent.innerText =
            '⏳ Mengecek...';
    }

    try {
        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                'is_verified_student_phone',
                {
                    p_phone: phone
                }
            );

        if (error) {
            throw error;
        }

        if (data === true) {
            if (studentVerificationStatus) {
                studentVerificationStatus.innerText =
                    '🎓 Status siswa: ✅ Terverifikasi';

                studentVerificationStatus.style.color =
                    '#16a34a';
            }

            if (btnApplyStudent) {
                btnApplyStudent.style.display =
                    'none';
            }

            if (paymentMethodGroup) {
                paymentMethodGroup.style.display =
                    'block';
            }

        } else {
            if (studentVerificationStatus) {
                studentVerificationStatus.innerText =
                    '🎓 Status siswa: belum terverifikasi.';

                studentVerificationStatus.style.color =
                    'var(--text-muted)';
            }

            if (btnApplyStudent) {
                btnApplyStudent.style.display =
                    'block';
            }

            if (paymentMethodGroup) {
                paymentMethodGroup.style.display =
                    'none';
            }
        }

    } catch (err) {
        console.error(
            'Gagal mengecek status siswa:',
            err
        );

        alert(
            '❌ Gagal mengecek status siswa. Silakan coba lagi.'
        );

    } finally {
        if (btnCheckStudent) {
            btnCheckStudent.disabled =
                false;

            btnCheckStudent.innerText =
                '🔎 Cek Status Siswa';
        }
    }
}


async function applyStudentStatus() {
    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : '';

    if (!phone) {
        alert(
            '❌ Masukkan nomor WhatsApp terlebih dahulu.'
        );

        return;
    }

    if (btnApplyStudent) {
        btnApplyStudent.disabled =
            true;

        btnApplyStudent.innerText =
            '⏳ Mengirim...';
    }

    try {
        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                'submit_student_verification',
                {
                    p_phone: phone
                }
            );

        if (error) {
            throw error;
        }

        if (
            data?.status ===
            'verified'
        ) {
            if (studentVerificationStatus) {
                studentVerificationStatus.innerText =
                    '🎓 Status siswa: ✅ Terverifikasi';

                studentVerificationStatus.style.color =
                    '#16a34a';
            }

            if (btnApplyStudent) {
                btnApplyStudent.style.display =
                    'none';
            }

            if (paymentMethodGroup) {
                paymentMethodGroup.style.display =
                    'block';
            }

        } else if (
            data?.status ===
            'pending'
        ) {
            if (studentVerificationStatus) {
                studentVerificationStatus.innerText =
                    '🎓 Status siswa: ⏳ Menunggu verifikasi admin';

                studentVerificationStatus.style.color =
                    '#d97706';
            }

            if (btnApplyStudent) {
                btnApplyStudent.style.display =
                    'none';
            }

            if (paymentMethodGroup) {
                paymentMethodGroup.style.display =
                    'none';
            }

            alert(
                '✅ Pengajuan status siswa berhasil dikirim. Tunggu verifikasi admin.'
            );

        } else {
            alert(
                data?.message ||
                '❌ Pengajuan tidak dapat diproses.'
            );
        }

    } catch (err) {
        console.error(
            'Gagal mengajukan status siswa:',
            err
        );

        alert(
            '❌ Gagal mengajukan status siswa: ' +
            err.message
        );

    } finally {
        if (btnApplyStudent) {
            btnApplyStudent.disabled =
                false;

            btnApplyStudent.innerText =
                '🎓 Ajukan Status Siswa';
        }
    }
}


if (btnCheckStudent) {
    btnCheckStudent.addEventListener(
        'click',
        checkStudentStatus
    );
}


if (btnApplyStudent) {
    btnApplyStudent.addEventListener(
        'click',
        applyStudentStatus
    );
}


if (phoneInput) {
    phoneInput.addEventListener(
        'input',
        resetStudentVerificationUI
    );

    phoneInput.addEventListener(
        'blur',
        checkStudentStatus
    );
}


// --- SUBMIT FORM & UPLOAD KE SUPABASE ---

let tempOrderData = null;

const orderForm =
    document.getElementById(
        'orderForm'
    );


function sanitizeFileName(name) {
    return String(
        name || 'file'
    )
        .normalize('NFKD')
        .replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
        )
        .replace(
            /_+/g,
            '_'
        );
}


function getStickerPricing(
    jenisStiker,
    finishing
) {
    let hargaSatuan = 25000;

    if (
        jenisStiker === 'Kromo'
    ) {
        hargaSatuan = 15000;

    } else if (
        jenisStiker === 'Roll'
    ) {
        hargaSatuan = 50000;
    }

    const multiplier =
        finishing ===
            'Tanpa Potong'
            ? 0.8
            : (
                finishing ===
                    'Die Cut'
                    ? 1.2
                    : 1.1
            );

    return (
        hargaSatuan *
        multiplier
    );
}


if (orderForm) {
    orderForm.addEventListener(
        'submit',
        async function (e) {
            e.preventDefault();

            const files =
                Array.from(
                    fileInput?.files ||
                        []
                );

            if (!files.length) {
                alert(
                    '❌ Harap pilih minimal 1 file terlebih dahulu!'
                );

                return;
            }

            const totalBytes =
                files.reduce(
                    (sum, file) =>
                        sum + file.size,
                    0
                );

            if (
                files.length >
                MAX_FILES_PER_ORDER
            ) {
                alert(
                    `❌ Maksimal ${MAX_FILES_PER_ORDER} file per pesanan.`
                );

                return;
            }

            if (
                files.some(
                    file =>
                        file.size >
                        MAX_FILE_SIZE_BYTES
                )
            ) {
                alert(
                    '❌ Setiap file maksimal 10MB.'
                );

                return;
            }

            if (
                totalBytes >
                MAX_TOTAL_UPLOAD_BYTES
            ) {
                alert(
                    '❌ Total ukuran semua file maksimal 50MB per pesanan.'
                );

                return;
            }

            const nama =
                document
                    .getElementById(
                        'nama'
                    )
                    .value
                    .trim();

            const phone =
                document
                    .getElementById(
                        'phone'
                    )
                    .value
                    .trim();

            const waktuAmbil =
                document
                    .getElementById(
                        'waktuAmbil'
                    )
                    .value;

            const kategori =
                kategoriLayanan.value;

            const catatan =
                document
                    .getElementById(
                        'catatan'
                    )
                    .value ||
                '-';

            const paymentMethod =
                getSelectedPaymentMethod();

            if (
                paymentMethod ===
                'COD'
            ) {
                const {
                    data: verified,
                    error: verifyError
                } =
                    await supabaseClient.rpc(
                        'is_verified_student_phone',
                        {
                            p_phone:
                                phone
                        }
                    );

                if (
                    verifyError ||
                    verified !== true
                ) {
                    alert(
                        '❌ Bayar di Tempat hanya tersedia untuk nomor WhatsApp siswa yang sudah terverifikasi.'
                    );

                    resetStudentVerificationUI();

                    return;
                }
            }

            let detailText = '';
            let totalHarga = 0;

            if (
                kategori ===
                'stiker'
            ) {
                const jenisStiker =
                    jenisStikerSelect.value;

                const jumlah =
                    Number(
                        document
                            .getElementById(
                                'jumlahLembarStiker'
                            )
                            .value
                    ) || 1;

                const finishing =
                    document
                        .getElementById(
                            'finishingStiker'
                        )
                        .value;

                const hargaSatuanEfektif =
                    getStickerPricing(
                        jenisStiker,
                        finishing
                    );

                totalHarga =
                    jumlah *
                    hargaSatuanEfektif;

                detailText =
                    `Stiker ${jenisStiker} - ${jumlah} ${
                        jenisStiker ===
                        'Roll'
                            ? 'Meter'
                            : 'Lembar A3+'
                    } (${finishing}) - ${files.length} File`;

            } else {
                const jumlahHalaman =
                    Number(
                        document
                            .getElementById(
                                'jumlahHalaman'
                            )
                            .value
                    ) || 1;

                const jumlahCopy =
                    Number(
                        document
                            .getElementById(
                                'jumlahCopy'
                            )
                            .value
                    ) || 1;

                const jenisCetak =
                    document.querySelector(
                        'input[name="jenisCetak"]:checked'
                    )?.value ||
                    'Hitam Putih';

                const ukuranKertasBase =
                    ukuranKertasSelect.value;

                const customUkuranText =
                    document
                        .getElementById(
                            'detailCustomUkuran'
                        )
                        .value ||
                    'Custom';

                const ukuranKertas =
                    ukuranKertasBase ===
                    'Custom'
                        ? `Custom (${customUkuranText})`
                        : ukuranKertasBase;

                let hargaPerHal =
                    jenisCetak ===
                    'Warna'
                        ? 2000
                        : 1000;

                if (
                    ukuranKertasBase ===
                    'A3+'
                ) {
                    hargaPerHal *= 2;
                }

                totalHarga =
                    jumlahHalaman *
                    jumlahCopy *
                    hargaPerHal;

                detailText =
                    `${files.length} File - ${jumlahHalaman} Hal x ${jumlahCopy} Rangkap (${jenisCetak} - ${ukuranKertas})`;
            }

            tempOrderData = {
                nama,
                phone,
                waktuAmbil,
                kategori,
                detailText,
                catatan,
                files,
                totalHarga,
                paymentMethod
            };

            document.getElementById(
                'mNama'
            ).innerText = nama;

            document.getElementById(
                'mPhone'
            ).innerText = phone;

            document.getElementById(
                'mAmbil'
            ).innerText =
                waktuAmbil;

            document.getElementById(
                'mDetail'
            ).innerText =
                `${detailText}\n\nFile:\n${files
                    .map(
                        (file, i) =>
                            `${i + 1}. ${file.name}`
                    )
                    .join('\n')}`;

            document.getElementById(
                'mTotal'
            ).innerText =
                'Rp ' +
                totalHarga.toLocaleString(
                    'id-ID'
                );

            const modalPayment =
                document.getElementById(
                    'mPaymentMethod'
                );

            if (modalPayment) {
                modalPayment.innerText =
                    paymentMethod ===
                    'COD'
                        ? '🏪 Bayar di Tempat'
                        : '💳 QRIS';
            }

            document.getElementById(
                'confirmModal'
            ).style.display =
                'flex';
        }
    );
}


function closeConfirmModal() {
    document.getElementById(
        'confirmModal'
    ).style.display =
        'none';
}


const btnProceedInvoice =
    document.getElementById(
        'btnProceedInvoice'
    );


if (btnProceedInvoice) {
    btnProceedInvoice.onclick =
        async function () {
            if (!tempOrderData)
                return;

            btnProceedInvoice.disabled =
                true;

            btnProceedInvoice.innerText =
                "⏳ Mengunggah...";

            const uploadedPaths = [];

            try {
                const uploadedFiles = [];

                for (
                    const file of
                    tempOrderData.files
                ) {
                    const fileNameCloud =
                        `${Date.now()}_${crypto.randomUUID()}_${sanitizeFileName(file.name)}`;

                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                'kohan-files'
                            )
                            .upload(
                                fileNameCloud,
                                file,
                                {
                                    upsert:
                                        false
                                }
                            );

                    if (uploadError) {
                        throw uploadError;
                    }

                    uploadedPaths.push(
                        fileNameCloud
                    );

                    uploadedFiles.push({
                        path:
                            fileNameCloud,

                        name:
                            file.name,

                        size:
                            file.size,

                        type:
                            file.type ||
                            'application/octet-stream'
                    });
                }

                const firstFile =
                    uploadedFiles[0] ||
                    null;

                const {
                    error: dbError
                } =
                    await supabaseClient
                        .from(
                            'orders'
                        )
                        .insert([
                            {
                                nama:
                                    tempOrderData.nama,

                                phone:
                                    tempOrderData.phone,

                                kategori:
                                    tempOrderData.kategori,

                                detail_cetak:
                                    tempOrderData.detailText,

                                catatan:
                                    tempOrderData.catatan,

                                waktu_ambil:
                                    tempOrderData.waktuAmbil,

                                total_harga:
                                    tempOrderData.totalHarga,

                                payment_method:
                                    tempOrderData.paymentMethod,

                                status:
                                    tempOrderData.paymentMethod ===
                                    'COD'
                                        ? '🖨️ DIPROSES'
                                        : 'Menunggu Pembayaran (UNPAID)',

                                file_url:
                                    firstFile?.path ||
                                    null,

                                file_name:
                                    firstFile?.name ||
                                    null,

                                files:
                                    uploadedFiles
                            }
                        ]);

                if (dbError) {
                    throw dbError;
                }


                // RLS sengaja tidak memberi SELECT langsung ke customer.
                // Ambil nomor antrean terbaru lewat RPC tracking.
                const {
                    data: latestOrders,
                    error: latestOrderError
                } =
                    await supabaseClient.rpc(
                        'get_orders_by_phone',
                        {
                            p_phone:
                                tempOrderData.phone
                        }
                    );

                if (
                    latestOrderError
                ) {
                    console.warn(
                        'Nomor antrean tidak dapat dimuat setelah insert:',
                        latestOrderError
                    );
                }

                const noAntrian =
                    Array.isArray(
                        latestOrders
                    ) &&
                    latestOrders.length
                        ? (
                            latestOrders[0]
                                ?.no_antrian ||
                            '-'
                        )
                        : '-';

                const fileNamesText =
                    uploadedFiles
                        .map(
                            (file, index) =>
                                `${index + 1}. ${file.name}`
                        )
                        .join('\n');


                document.getElementById(
                    'invPhone'
                ).innerText =
                    tempOrderData.phone;

                document.getElementById(
                    'invNama'
                ).innerText =
                    tempOrderData.nama;

                document.getElementById(
                    'invDetail'
                ).innerText =
                    `[NO ANTREAN: ${noAntrian}]\n${tempOrderData.detailText}\n\nFile:\n${fileNamesText}\n\nAmbil: ${tempOrderData.waktuAmbil}`;

                document.getElementById(
                    'invTotal'
                ).innerText =
                    'Rp ' +
                    tempOrderData.totalHarga.toLocaleString(
                        'id-ID'
                    );


                const invoiceQrisArea =
                    document.getElementById(
                        'invoiceQrisArea'
                    );

                const invoiceCodArea =
                    document.getElementById(
                        'invoiceCodArea'
                    );

                const invoicePaymentTitle =
                    document.getElementById(
                        'invoicePaymentTitle'
                    );

                const invoiceTimer =
                    document.getElementById(
                        'invoiceTimer'
                    );


                if (
                    tempOrderData.paymentMethod ===
                    'COD'
                ) {
                    if (
                        invoiceQrisArea
                    ) {
                        invoiceQrisArea.style.display =
                            'none';
                    }

                    if (
                        invoiceCodArea
                    ) {
                        invoiceCodArea.style.display =
                            'block';
                    }

                    if (
                        invoicePaymentTitle
                    ) {
                        invoicePaymentTitle.innerText =
                            'Bayar di Tempat';
                    }

                    if (invoiceTimer) {
                        invoiceTimer.style.display =
                            'none';
                    }

                } else {
                    if (
                        invoiceQrisArea
                    ) {
                        invoiceQrisArea.style.display =
                            'block';
                    }

                    if (
                        invoiceCodArea
                    ) {
                        invoiceCodArea.style.display =
                            'none';
                    }

                    if (
                        invoicePaymentTitle
                    ) {
                        invoicePaymentTitle.innerText =
                            'Selesaikan Pembayaran';
                    }

                    if (invoiceTimer) {
                        invoiceTimer.style.display =
                            'block';
                    }

                    const pesanWA =
                        `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*No Antrean:* ${noAntrian}\n*No WA:* ${tempOrderData.phone}\n*Nama:* ${tempOrderData.nama}\n*Waktu Ambil:* ${tempOrderData.waktuAmbil}\n*Detail:* ${tempOrderData.detailText}\n*File:* ${tempOrderData.files.length} file\n*Catatan:* ${tempOrderData.catatan}\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;

                    document.getElementById(
                        'btnInvWA'
                    ).href =
                        `https://wa.me/${ADMIN_WA}?text=` +
                        encodeURIComponent(
                            pesanWA
                        );
                }


                closeConfirmModal();


                const navInvoice =
                    document.getElementById(
                        'nav-invoice'
                    );

                const bnavInvoice =
                    document.getElementById(
                        'bnav-invoice'
                    );


                if (navInvoice) {
                    navInvoice.style.display =
                        'inline-block';
                }

                if (bnavInvoice) {
                    bnavInvoice.style.display =
                        'flex';
                }


                if (
                    typeof window.switchPage ===
                    'function'
                ) {
                    window.switchPage(
                        'invoice'
                    );
                }


                if (
                    tempOrderData.paymentMethod ===
                    'COD'
                ) {
                    clearInterval(
                        countdownInterval
                    );
                } else {
                    startInvoiceTimer(
                        600
                    );
                }


                orderForm.reset();

                renderSelectedFiles([]);

                handleKategoriChange();

                updatePrice();

                generateJadwalAmbil();

            } catch (err) {

                // Clean up files if order insert failed after upload.
                if (
                    uploadedPaths.length
                ) {
                    await supabaseClient
                        .storage
                        .from(
                            'kohan-files'
                        )
                        .remove(
                            uploadedPaths
                        )
                        .catch(
                            () => {}
                        );
                }

                alert(
                    '❌ Gagal menyimpan pesanan: ' +
                    err.message
                );

            } finally {
                btnProceedInvoice.disabled =
                    false;

                btnProceedInvoice.innerText =
                    "Lanjutkan 🚀";
            }
        };
}


// --- LACAK PESANAN PAKAI NOMOR WHATSAPP ---

async function lacakStatusPesanan() {
    const keyword =
        document.getElementById(
            'trackInput'
        ).value.trim();

    const resultDiv =
        document.getElementById(
            'trackResult'
        );

    resultDiv.style.display =
        'block';

    if (!keyword) {
        resultDiv.innerHTML =
            '<p style="color: #d97706; font-size: 13px; margin:0; background: #fef3c7; padding: 10px; border-radius: 6px;">⚠️ Masukkan Nomor WhatsApp Anda.</p>';

        return;
    }

    resultDiv.innerHTML =
        '<p style="color: #64748b; font-size: 13px; margin:0;">⏳ Mencari pesanan...</p>';


    const {
        data: found,
        error
    } =
        await supabaseClient.rpc(
            'get_orders_by_phone',
            {
                p_phone:
                    keyword
            }
        );


    if (error) {
        console.error(
            'Tracking error:',
            error
        );

        resultDiv.innerHTML =
            '<p style="color: #dc2626; font-size: 13px; margin:0;">❌ Gagal memuat data pesanan.</p>';

        return;
    }


    if (
        found &&
        found.length > 0
    ) {
        let html =
            '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; color:#1e293b;">';


        found.forEach(
            o => {
                const phone =
                    o.phone || '';

                const maskedPhone =
                    phone.length > 4
                        ? phone.slice(
                            0,
                            -4
                        ) + 'XXXX'
                        : 'XXXX';

                const status =
                    o.status || '-';

                const badgeBg =
                    status.includes(
                        'UNPAID'
                    )
                        ? '#fef3c7'
                        : (
                            status.includes(
                                'SIAP'
                            )
                                ? '#dcfce7'
                                : '#e0f2fe'
                        );

                const badgeColor =
                    status.includes(
                        'UNPAID'
                    )
                        ? '#d97706'
                        : (
                            status.includes(
                                'SIAP'
                            )
                                ? '#16a34a'
                                : '#0284c7'
                        );


                html += `
                    <div style="
                        margin-bottom:12px;
                        padding-bottom:8px;
                        border-bottom:1px solid #eee;
                    ">

                        <p style="margin:2px 0;">
                            <b>No Antrean:</b>

                            <span style="
                                color:#2563eb;
                                font-weight:bold;
                            ">
                                ${o.no_antrian || '-'}
                            </span>
                        </p>


                        <p style="margin:2px 0;">
                            <b>Pemesan:</b>

                            ${o.nama || '-'}
                            (${maskedPhone})
                        </p>


                        <p style="margin:2px 0;">
                            <b>Status:</b>

                            <span style="
                                color:${badgeColor};
                                font-weight:bold;
                                background:${badgeBg};
                                padding:2px 8px;
                                border-radius:4px;
                                display:inline-block;
                            ">
                                ${status}
                            </span>
                        </p>


                        <p style="
                            margin:2px 0;
                            color:#64748b;
                        ">
                            <b>Detail:</b>
                            ${o.detail_cetak || '-'}
                        </p>


                        <p style="
                            margin:2px 0;
                            color:#64748b;
                        ">
                            <b>Ambil:</b>
                            ${o.waktu_ambil || '-'}
                        </p>


                        <p style="
                            margin:2px 0;
                            font-size:14px;
                        ">
                            <b>Total:</b>

                            <span style="
                                color:#2563eb;
                                font-weight:bold;
                            ">
                                Rp ${
                                    Number(
                                        o.total_harga ||
                                        0
                                    ).toLocaleString(
                                        'id-ID'
                                    )
                                }
                            </span>
                        </p>

                    </div>
                `;
            }
        );


        html += '</div>';

        resultDiv.innerHTML =
            html;

    } else {
        resultDiv.innerHTML =
            '<p style="color: #dc2626; font-size: 13px; margin:0; background: #fee2e2; padding: 10px; border-radius: 6px;">❌ Tidak ada riwayat pesanan dengan Nomor WhatsApp tersebut.</p>';
    }
}


// --- FITUR FEEDBACK & RATING DENGAN FOTO PROFIL ---

const feedbackForm =
    document.getElementById(
        'feedbackForm'
    );


if (feedbackForm) {
    feedbackForm.addEventListener(
        'submit',
        async function (e) {
            e.preventDefault();

            const nama =
                document.getElementById(
                    'fbNama'
                ).value.trim();

            const rating =
                parseInt(
                    document.getElementById(
                        'fbRating'
                    ).value
                ) || 5;

            const komentar =
                document.getElementById(
                    'fbKomentar'
                ).value.trim();

            const fotoInput =
                document.getElementById(
                    'fbFoto'
                );

            const btn =
                document.getElementById(
                    'btnSubmitFeedback'
                );

            btn.disabled =
                true;

            btn.innerText =
                "Mengirim Ulasan...";


            try {
                let fotoUrl =
                    null;


                if (
                    fotoInput.files &&
                    fotoInput.files[0]
                ) {
                    const fotoFile =
                        fotoInput.files[0];


                    if (
                        fotoFile.size >
                        2 *
                        1024 *
                        1024
                    ) {
                        throw new Error(
                            "Ukuran foto profil maksimal 2MB!"
                        );
                    }


                    const fileNameFoto =
                        `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fotoFile.name.split('.').pop()}`;


                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                'kohan-files'
                            )
                            .upload(
                                fileNameFoto,
                                fotoFile
                            );


                    if (uploadError) {
                        throw uploadError;
                    }


                    const {
                        data: urlData
                    } =
                        supabaseClient
                            .storage
                            .from(
                                'kohan-files'
                            )
                            .getPublicUrl(
                                fileNameFoto
                            );


                    fotoUrl =
                        urlData.publicUrl;
                }


                const {
                    error: dbError
                } =
                    await supabaseClient
                        .from(
                            'feedbacks'
                        )
                        .insert([
                            {
                                nama,
                                rating,
                                komentar,
                                foto_url:
                                    fotoUrl
                            }
                        ]);


                if (dbError) {
                    throw dbError;
                }


                alert(
                    '✨ Terima kasih! Ulasan dan foto profil kamu berhasil dikirim.'
                );


                feedbackForm.reset();

                loadFeedbackList();

            } catch (err) {
                alert(
                    '❌ Gagal mengirim ulasan: ' +
                    err.message
                );

            } finally {
                btn.disabled =
                    false;

                btn.innerText =
                    "Kirim Ulasan 🚀";
            }
        }
    );
}


async function loadFeedbackList() {
    const container =
        document.getElementById(
            'listFeedbackContainer'
        );

    if (!container) return;


    container.innerHTML =
        '<p style="color: var(--text-muted); font-size: 13px; text-align: center;">Memuat ulasan...</p>';


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                'feedbacks'
            )
            .select('*')
            .order(
                'id',
                {
                    ascending:
                        false
                }
            )
            .limit(10);


    if (error) {
        container.innerHTML =
            '<p style="color: #dc2626; font-size: 13px; text-align: center;">Gagal memuat ulasan.</p>';

        return;
    }


    if (
        data &&
        data.length > 0
    ) {
        let html = '';


        data.forEach(
            item => {
                let starsHtml =
                    '⭐'.repeat(
                        item.rating
                    );

                let avatarHtml =
                    '';


                if (
                    item.foto_url
                ) {
                    avatarHtml =
                        `<img src="${item.foto_url}" alt="${item.nama}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);">`;

                } else {
                    let initial =
                        item.nama
                            ? item.nama
                                .charAt(
                                    0
                                )
                                .toUpperCase()
                            : 'U';

                    avatarHtml =
                        `<div style="width:40px;height:40px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;">${initial}</div>`;
                }


                html += `
                    <div style="
                        background:var(--box-bg);
                        border:1px solid var(--border-color);
                        padding:14px;
                        border-radius:12px;
                        font-size:13px;
                        display:flex;
                        gap:12px;
                        align-items:flex-start;
                    ">

                        <div>
                            ${avatarHtml}
                        </div>


                        <div style="flex:1;">

                            <div style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                margin-bottom:4px;
                            ">

                                <b style="
                                    font-size:14px;
                                    color:var(--text-main);
                                ">
                                    ${item.nama}
                                </b>


                                <span style="
                                    color:#f59e0b;
                                    font-size:12px;
                                ">
                                    ${starsHtml}
                                </span>

                            </div>


                            <p style="
                                margin:0;
                                color:var(--text-muted);
                                line-height:1.5;
                            ">
                                ${item.komentar}
                            </p>

                        </div>

                    </div>
                `;
            }
        );


        container.innerHTML =
            html;

    } else {
        container.innerHTML =
            '<p style="color: var(--text-muted); font-size: 13px; text-align: center;">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>';
    }
}