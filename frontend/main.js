document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const fileInput = document.getElementById('pdfFile');
  const btnSubmit = document.getElementById('btnSubmit');
  const errorMsg = document.getElementById('errorMsg');
  const resultCard = document.getElementById('resultCard');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const btnWhatsapp = document.getElementById('btnWhatsapp');

  // Silakan sesuaikan nomor WhatsApp toko kamu (format 62)
  const NO_WA_TOKO = '6281234567890'; 

  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileNameDisplay.innerText = 'File dipilih: ' + this.files[0].name;
    } else {
      fileNameDisplay.innerText = '';
    }
  });

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput.files[0]) {
      alert('Silakan pilih file PDF terlebih dahulu!');
      return;
    }

    const paperSize = document.getElementById('paperSize').value;
    const printMode = document.querySelector('input[name="printMode"]:checked').value;
    const bindingOption = document.getElementById('bindingOption').value;

    errorMsg.style.display = 'none';
    resultCard.classList.remove('active');
    btnWhatsapp.style.display = 'none';
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Sedang Menganalisis & Menghitung...';

    const formData = new FormData();
    formData.append('pdfFile', fileInput.files[0]);
    formData.append('paperSize', paperSize);
    formData.append('printMode', printMode);
    formData.append('bindingOption', bindingOption);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        document.getElementById('resOrderId').innerText = data.orderId;
        document.getElementById('resPages').innerText = data.totalPages + ' Halaman';
        document.getElementById('resPrintDetail').innerText = `${data.details.paperSize} (${data.details.printMode === 'bw' ? 'Hitam-Putih' : 'Warna'})`;
        document.getElementById('resPrintCost').innerText = 'Rp ' + data.details.printCost.toLocaleString('id-ID');
        document.getElementById('resBindingCost').innerText = 'Rp ' + data.details.bindingCost.toLocaleString('id-ID');
        document.getElementById('resPrice').innerText = 'Rp ' + data.totalPrice.toLocaleString('id-ID');

        // Format pesan WhatsApp
        const formatMode = data.details.printMode === 'bw' ? 'Hitam-Putih' : 'Warna';
        const formatJilid = data.details.bindingOption === 'none' ? 'Tanpa Jilid' : data.details.bindingOption;

        const pesanWA = `Halo KohanCopier, saya ingin konfirmasi pesanan cetak:

📄 *ID Pesanan:* ${data.orderId}
📁 *Nama File:* ${fileInput.files[0].name}
📃 *Jumlah Halaman:* ${data.totalPages} Halaman
📏 *Ukuran Kertas:* ${data.details.paperSize}
🎨 *Mode Cetak:* ${formatMode}
📚 *Jilid:* ${formatJilid}
💰 *Total Biaya:* Rp ${data.totalPrice.toLocaleString('id-ID')}

Mohon diproses, terima kasih!`;

        const waUrl = `https://wa.me/${NO_WA_TOKO}?text=${encodeURIComponent(pesanWA)}`;
        btnWhatsapp.href = waUrl;
        btnWhatsapp.style.display = 'block';

        resultCard.classList.add('active');
      } else {
        throw new Error(data.message || 'Gagal memproses pesanan');
      }

    } catch (err) {
      errorMsg.innerText = 'Error: ' + err.message;
      errorMsg.style.display = 'block';
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = 'Hitung Total & Pesan';
    }
  });
});