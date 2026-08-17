const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Admin
const ADMIN_PASSWORD = 'admin123'; 
const JWT_SECRET = 'kohancopier_secret_key_2026'; 

// Konfigurasi Supabase
const SUPABASE_URL = 'https://tiklapsoahcnryyefcvy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3R8KbqT32KvqfD_d_l10RQ_6xBMITx_';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware Basic
app.use(cors());
app.use(express.json());

// Melayani File Statis Frontend (Akses via http://localhost:3000)
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware Autentikasi Admin
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Akses ditolak! Silakan login.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Sesi habis atau token tidak valid!' });
    }
    req.user = user;
    next();
  });
}

// Konfigurasi Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // Maksimal 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file berformat PDF yang diperbolehkan!'));
    }
  }
});

// Helper Format Nama File
function sanitizeFileName(originalName) {
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/_+/g, '_');
}

// -------------------------------------------------------------
// ENDPOINTS API
// -------------------------------------------------------------

// A. Endpoint Login Admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ status: 'success', token: token });
  } else {
    return res.status(401).json({ status: 'error', message: 'Password salah!' });
  }
});

// B. Endpoint Upload PDF & Simpan Pesanan (Publik)
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'File tidak ditemukan!' });
    }

    const paperSize = req.body.paperSize || 'A4';
    const printMode = req.body.printMode || 'bw';
    const bindingOption = req.body.bindingOption || 'none';

    // 1. Analisis PDF
    const pdfData = await pdfParse(req.file.buffer);
    const totalPages = pdfData.numpages;

    // 2. Kalkulasi Biaya
    let ratePerPage = printMode === 'color' ? 1000 : 300;
    if (paperSize === 'A3') ratePerPage *= 2;
    const printCost = totalPages * ratePerPage;

    let bindingCost = 0;
    if (bindingOption === 'lakban') bindingCost = 5000;
    else if (bindingOption === 'spiral') bindingCost = 10000;
    else if (bindingOption === 'hardcover') bindingCost = 25000;

    const totalPrice = printCost + bindingCost;

    // 3. Upload File PDF ke Supabase Storage
    const today = new Date().toISOString().split('T')[0];
    const orderId = 'ORD-' + Date.now();
    const cleanName = sanitizeFileName(req.file.originalname);
    const destinationPath = `${today}/${orderId}/${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(destinationPath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    // 4. Dapatkan Public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(destinationPath);

    // 5. Simpan Data Pesanan ke Database Supabase
    const { error: dbError } = await supabase.from('orders').insert([
      {
        order_id: orderId,
        file_name: req.file.originalname,
        total_pages: totalPages,
        paper_size: paperSize,
        print_mode: printMode,
        binding_option: bindingOption,
        total_price: totalPrice,
        storage_path: destinationPath,
        file_url: urlData.publicUrl,
        status: 'Pending'
      }
    ]);

    if (dbError) throw dbError;

    res.json({
      status: 'success',
      orderId: orderId,
      totalPages: totalPages,
      totalPrice: totalPrice,
      details: { paperSize, printMode, bindingOption, printCost, bindingCost }
    });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ status: 'error', message: err.message || 'Gagal memproses pesanan' });
  }
});

// C. Endpoint Ambil Daftar Pesanan (Khusus Admin)
app.get('/api/orders', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// D. Endpoint Update Status Pesanan & Hapus File Otomatis Jika Selesai (Khusus Admin)
app.patch('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Ambil data pesanan untuk mendapatkan storage_path
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('storage_path, status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan!' });
    }

    // 2. Jika status diubah ke 'Selesai', hapus file dari Supabase Storage
    if (status === 'Selesai' && order.storage_path) {
      const { error: deleteStorageError } = await supabase.storage
        .from('documents')
        .remove([order.storage_path]);

      if (deleteStorageError) {
        console.error('Gagal menghapus file dari Storage:', deleteStorageError.message);
      }
    }

    // 3. Update status pesanan & kosongkan link file di database jika selesai
    const updateData = { status: status };
    if (status === 'Selesai') {
      updateData.storage_path = null;
      updateData.file_url = null;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ 
      status: 'success', 
      message: status === 'Selesai' 
        ? 'Pesanan selesai dan file PDF telah dihapus demi privasi.' 
        : 'Status berhasil diperbarui.' 
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// E. Endpoint Cek Status Pesanan Publik (Untuk Pembeli)
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_id, file_name, total_pages, paper_size, print_mode, binding_option, total_price, status, created_at')
      .eq('order_id', orderId.trim())
      .single();

    if (error || !order) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'ID Pesanan tidak ditemukan. Pastikan kode yang dimasukkan benar!' 
      });
    }

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Server KohanCopier Berjalan!`);
  console.log(`Halaman Utama Pembeli: http://localhost:${PORT}/index.html`);
  console.log(`Halaman Cek Status:    http://localhost:${PORT}/track.html`);
  console.log(`Dashboard Admin/Kasir: http://localhost:${PORT}/admin.html`);
  console.log(`==================================================`);
});