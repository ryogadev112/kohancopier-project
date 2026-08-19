// Database sementara yang bisa diakses bersama oleh Admin & Customer
global.ordersDb = global.ordersDb || [];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // MENYIMPAN PESANAN BARU (Dari Form Utama)
    if (req.method === 'POST') {
        const newOrder = req.body;
        if (newOrder && newOrder.id) {
            global.ordersDb.push(newOrder);
        }
        return res.status(200).json({ success: true, message: 'Pesanan tersimpan!' });
    }

    // MENGAMBIL DATA PESANAN (Untuk Admin / Track)
    if (req.method === 'GET') {
        const { id } = req.query;
        // Jika mencari ID spesifik (Lacak Pesanan)
        if (id) {
            const found = global.ordersDb.find(o => o.id === id);
            return res.status(200).json({ success: !!found, order: found });
        }
        // Jika mengambil semua pesanan (Dashboard Admin)
        return res.status(200).json({ success: true, orders: global.ordersDb });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};