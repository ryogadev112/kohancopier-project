const ADMIN_WA = "6281318541990";

const jumlahHalamanInput = document.getElementById('jumlahHalaman');
const jenisCetakSelect = document.getElementById('jenisCetak');
const pricePreview = document.getElementById('pricePreview');

function updatePrice() {
    const hal = parseInt(jumlahHalamanInput.value) || 1;
    const jenis = jenisCetakSelect.value;
    const hargaPerHal = jenis === 'Warna' ? 2000 : 1000;
    const total = hal * hargaPerHal;
    pricePreview.innerText = "Rp " + total.toLocaleString('id-ID');
}

if (jumlahHalamanInput && jenisCetakSelect) {
    jumlahHalamanInput.addEventListener('input', updatePrice);
    jenisCetakSelect.addEventListener('change', updatePrice);
}

let countdownInterval;
function startInvoiceTimer(durationInSeconds) {
    clearInterval(countdownInterval);
    let timer = durationInSeconds;
    const timerDisplay = document.getElementById('invoiceTimer');
    
    countdownInterval = setInterval(() => {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timerDisplay) {
            timerDisplay.innerText = "⏱️ " + minutes + ":" + seconds;
        }

        if (--timer < 0) {
            clearInterval(countdownInterval);
            if (timerDisplay) {
                timerDisplay.innerText = "⏱️ Waktu Habis!";
                timerDisplay.style.background = "#fee2e2";
            }
        }
    }, 1000);
}

let tempOrderData = null;

const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nama = document.getElementById('nama').value;
        const phone = document.getElementById('phone').value;
        const jumlahHalaman = document.getElementById('jumlahHalaman').value;
        const jenisCetak = document.getElementById('jenisCetak').value;
        const catatan = document.getElementById('catatan').value || '-';
        const fileInput = document.getElementById('file');
        const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Tidak ada file';

        const orderId = 'KC-' + Math.floor(1000000000 + Math.random() * 9000000000);
        const hargaPerHal = jenisCetak === 'Warna' ? 2000 : 1000;
        const totalHarga = jumlahHalaman * hargaPerHal;

        tempOrderData = {
            orderId, nama, phone, jumlahHalaman, jenisCetak, catatan, fileName, totalHarga, status: 'UNPAID', tanggal: new Date().toLocaleString()
        };

        document.getElementById('mNama').innerText = nama;
        document.getElementById('mPhone').innerText = phone;
        document.getElementById('mDetail').innerText = jumlahHalaman + ' Halaman (' + jenisCetak + ')';
        document.getElementById('mTotal').innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');

        document.getElementById('confirmModal').style.display = 'flex';
    });
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

const btnProceedInvoice = document.getElementById('btnProceedInvoice');
if (btnProceedInvoice) {
    btnProceedInvoice.onclick = function() {
        if (!tempOrderData) return;

        let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
        riwayat.push(tempOrderData);
        localStorage.setItem('kohancopier_orders', JSON.stringify(riwayat));

        document.getElementById('invId').innerText = tempOrderData.orderId;
        document.getElementById('invNama').innerText = tempOrderData.nama + ' (' + tempOrderData.phone + ')';
        document.getElementById('invDetail').innerText = tempOrderData.jumlahHalaman + ' Halaman (' + tempOrderData.jenisCetak + ') - ' + tempOrderData.fileName;
        document.getElementById('invTotal').innerText = 'Rp ' + tempOrderData.totalHarga.toLocaleString('id-ID');

        const pesanWA = `Halo Admin KohanCopier, saya ingin konfirmasi pembayaran QRIS.\n\n*ID Invoice:* ${tempOrderData.orderId}\n*Nama:* ${tempOrderData.nama}\n*Detail:* ${tempOrderData.jumlahHalaman} Hal (${tempOrderData.jenisCetak})\n*Total:* Rp ${tempOrderData.totalHarga.toLocaleString('id-ID')}\n\nBerikut bukti pembayarannya:`;
        document.getElementById('btnInvWA').href = `https://wa.me/${ADMIN_WA}?text=` + encodeURIComponent(pesanWA);

        closeConfirmModal();
        const navInvoice = document.getElementById('nav-invoice');
        if (navInvoice) navInvoice.style.display = 'block';

        switchPage('invoice');
        startInvoiceTimer(600);

        orderForm.reset();
        updatePrice();
    };
}

function lacakStatusPesanan() {
    const keyword = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    if (!keyword) {
        alert('Masukkan ID Pesanan atau No WhatsApp!');
        return;
    }

    let riwayat = JSON.parse(localStorage.getItem('kohancopier_orders')) || [];
    const found = riwayat.filter(o => o.orderId.toLowerCase().includes(keyword.toLowerCase()) || o.phone.includes(keyword));

    resultDiv.style.display = 'block';
    if (found.length > 0) {
        let html = '<div style="background:white; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">';
        found.forEach(o => {
            html += `<p style="margin:4px 0;"><b>ID:</b> ${o.orderId} | <b>Nama:</b> ${o.nama} | <b>Status:</b> <span style="color:#d97706; font-weight:bold;">${o.status}</span></p>`;
            html += `<p style="margin:4px 0; color:#64748b;">Detail: ${o.jumlahHalaman} Hal (${o.jenisCetak}) - Total: Rp ${o.totalHarga.toLocaleString('id-ID')}</p><hr style="border:0; border-top:1px solid #eee; margin:8px 0;">`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = '<p style="color: #dc2626; font-size: 13px; margin:0;">Pesanan tidak ditemukan. Pastikan ID atau No WA benar.</p>';
    }
}