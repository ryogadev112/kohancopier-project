const DB_ENDPOINT = "https://kvable.io/api/kohancopier_orders_db_2026";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. MENYIMPAN PESANAN BARU
    if (req.method === 'POST') {
        try {
            const newOrder = req.body;

            // Ambil data lama
            let ordersList = [];
            try {
                const getRes = await fetch(DB_ENDPOINT);
                if (getRes.ok) {
                    const data = await getRes.json();
                    ordersList = Array.isArray(data) ? data : [];
                }
            } catch (e) {
                ordersList = [];
            }

            // Tambahkan pesanan baru di paling depan
            if (newOrder && newOrder.id) {
                ordersList.unshift(newOrder);
            }

            // Simpan kembali data terbaru ke Cloud DB
            await fetch(DB_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ordersList)
            });

            return res.status(200).json({ success: true, message: 'Pesanan tersimpan!' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // 2. MENGAMBIL DATA PESANAN (UNTUK ADMIN & TRACK)
    if (req.method === 'GET') {
        try {
            const { id } = req.query;
            const getRes = await fetch(DB_ENDPOINT);
            let ordersList = [];

            if (getRes.ok) {
                const data = await getRes.json();
                ordersList = Array.isArray(data) ? data : [];
            }

            // Jika dipanggil dari fitur Lacak Pesanan
            if (id) {
                const found = ordersList.find(o => o.id === id);
                return res.status(200).json({ success: !!found, order: found });
            }

            // Jika dipanggil dari Dashboard Admin
            return res.status(200).json({ success: true, orders: ordersList });
        } catch (err) {
            return res.status(200).json({ success: true, orders: [] });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};