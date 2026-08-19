let orderMemory = [];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // SIMPAN PESANAN BARU
        if (req.method === 'POST') {
            const newOrder = req.body;
            if (newOrder && newOrder.id) {
                orderMemory.unshift(newOrder);
            }
            return res.status(200).json({ success: true, orders: orderMemory });
        }

        // BACA DATA PESANAN (Admin & Track)
        if (req.method === 'GET') {
            const { id } = req.query;
            if (id) {
                const found = orderMemory.find(o => o.id === id);
                return res.status(200).json({ success: true, order: found });
            }
            return res.status(200).json({ success: true, orders: orderMemory });
        }
    } catch (err) {
        // Selalu kembalikan respon sukses dengan array kosong jika terjadi kesalahan
        return res.status(200).json({ success: true, orders: [] });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};