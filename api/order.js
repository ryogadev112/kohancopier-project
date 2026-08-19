const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygZAOIByubAG6QRE7aG8NkWCkUhvNIOVC3XAb0p5BL4FAlTbsE48HUmCkM-UNYF6XVgg/exec";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // SIMPAN PESANAN BARU KE GOOGLE SHEETS
        if (req.method === 'POST') {
            const resp = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
                redirect: 'follow'
            });
            return res.status(200).json({ success: true, message: 'Tersimpan ke Google Sheets!' });
        }

        // BACA DATA PESANAN DARI GOOGLE SHEETS
        if (req.method === 'GET') {
            const { id } = req.query;
            const response = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
            const data = await response.json();
            const orders = data.orders || [];

            if (id) {
                const found = orders.find(o => o.id === id);
                return res.status(200).json({ success: !!found, order: found });
            }

            return res.status(200).json({ success: true, orders: orders });
        }
    } catch (error) {
        console.error("Error connected to Google Sheets:", error);
        return res.status(200).json({ success: true, orders: [] });
    }
};