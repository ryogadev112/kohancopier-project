const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database dummy sementara (tersimpan di memory serverless)
let orders = [];

// Endpoint Login Admin
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body || {};
        
        if (username === 'admin' && password === 'admin123') {
            return res.status(200).json({ 
                success: true, 
                message: 'Login Berhasil!' 
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Username atau Password salah!' 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Endpoint Ambil Daftar Pesanan
app.get('/api/orders', (req, res) => {
    res.status(200).json(orders);
});

// Endpoint Lacak Pesanan
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        res.status(200).json({ success: true, order });
    } else {
        res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
});

// Export Express app untuk Vercel Serverless Function
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}