const JSONBIN_URL = "https://api.jsonbin.io/v3/b/661a8f3be41b4d34e4e3e3e3"; // Endpoint Storage Gratis

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // SIMPAN PESANAN BARU
    if (req.method === 'POST') {
        try {
            const newOrder = req.body;
            
            // 1. Ambil data lama dari cloud storage (npoint/jsonbin)
            const getRes = await fetch('https://api.npoint.io/4e2402179a6136d1b712');
            let currentOrders = [];
            
            if (getRes.ok) {
                const data = await getRes.json();
                currentOrders = Array.isArray(data) ? data : [];
            }

            // 2. Tambahkan pesanan baru
            if (newOrder && newOrder.id) {
                currentOrders.push(newOrder);
            }

            // 3. Simpan kembali ke cloud storage
            await fetch('https://api.npoint.io/4e2402179a6136d1b712', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentOrders)
            });

            return res.status(200).json({ success: true, message: 'Pesanan tersimpan permanen!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Gagal menyimpan ke database' });
        }
    }

    // AMBIL DATA PESANAN (Admin & Track)
    if (req.method === 'GET') {
        try {
            const { id } = req.query;
            const getRes = await fetch('https://api.npoint.io/4e2402179a6136d1b712');
            let orders = [];

            if (getRes.ok) {
                orders = await getRes.json();
                if (!Array.isArray(orders)) orders = [];
            }

            if (id) {
                const found = orders.find(o => o.id === id);
                return res.status(200).json({ success: !!found, order: found });
            }

            return res.status(200).json({ success: true, orders: orders });
        } catch (error) {
            return res.status(200).json({ success: true, orders: [] });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};