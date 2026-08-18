const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: '/tmp/' });

let orders = [];

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

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({ success: true, token: 'secret-token-123' });
    }
    return res.status(401).json({ success: false, message: 'Username atau Password Salah!' });
});

app.get('/api/orders', (req, res) => {
    res.status(200).json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        res.status(200).json({ success: true, order });
    } else {
        res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}