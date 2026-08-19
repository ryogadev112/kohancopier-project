// Memanfaatkan memory global yang di-cache Vercel Serverless
if (!global.ordersList) {
    global.ordersList = [];
}

module.exports = (req, res) => {
    // Header CORS Lengkap
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // SIMPAN PESANAN
    if (req.method === 'POST') {
        try {
            const newOrder = req.body;
            if (newOrder && newOrder.id) {
                global.ordersList.push(newOrder);
            }
            return res.status(200).json({ 
                success: true, 
                message: 'Pesanan tersimpan!',
                orders: global.ordersList 
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // BACA PESANAN
    if (req.method === 'GET') {
        const { id } = req.query;
        if (id) {
            const found = global.ordersList.find(o => o.id === id);
            return res.status(200).json({ success: !!found, order: found });
        }
        return res.status(200).json({ 
            success: true, 
            orders: global.ordersList || [] 
        });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};