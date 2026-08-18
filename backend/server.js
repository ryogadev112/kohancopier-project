const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simpan file sementara di folder /tmp (standar Vercel Serverless)
const upload = multer({ dest: '/tmp/' });

// In-memory data storage (simulasi database sederhana)
let orders = [];

// API Endpoint Upload Pesanan
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        const { nama, phone, jumlahHalaman, jenisCetak, catatan } = req.body;
        const orderId = 'KC-' + Date.now();

        const newOrder = {
            id: orderId,
            nama: nama || 'Tanpa Nama',
            phone: phone || '-',
            jumlahHalaman: jumlahHalaman || 1,
            jenisCetak: jenisCetak || 'Hitam Putih',
            catatan: catatan || '-',
            file: req.file ? req.file.originalname : 'Tidak Ada File',
            status: 'Pending',
            createdAt: new Date()
        };

        orders.push(newOrder);

        return res.status(200).json({
            success: true,
            orderId: orderId,
            message: 'Pesanan berhasil dibuat!'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// API Endpoint Login Admin
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Password default admin
    if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({ success: true, token: 'secret-token-123' });
    }
    return res.status(401).json({ success: false, message: 'Username atau Password Salah!' });
});

// API Endpoint Ambil Semua Pesanan
app.get('/api/orders', (req, res) => {
    res.status(200).json(orders);
});

// API Endpoint Lacak Pesanan
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        res.status(200).json({ success: true, order });
    } else {
        res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
});

// Export app untuk Vercel Serverless
module.exports = app;

// Jalankan lokal jika tidak di Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}