const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygZAOIByubAG6QRE7aG8NkWCkUhvNIOVC3XAb0p5BL4FAlTbsE48HUmCkM-UNYF6XVgg/exec";

module.exports = async (req, res) => {
    // Header CORS Lengkap
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 1. SIMPAN PESANAN (Kirim dari Vercel Server -> Google Apps Script)
        if (req.method === 'POST') {
            const data = req.body || {};
            const params = new URLSearchParams(data).toString();

            // Panggilan Server-to-Server (Bypass blokir browser 100%)
            await fetch(`${GOOGLE_SCRIPT_URL}?${params}`, {
                method: 'GET',
                redirect: 'follow'
            });

            return res.status(200).json({ success: true, message: 'Berhasil tersimpan ke Google Sheets!' });
        }

        // 2. BACA PESANAN (Untuk Admin / Track)
        if (req.method === 'GET') {
            const { id } = req.query;
            const response = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
            const result = await response.json();
            const orders = result.orders || [];

            if (id) {
                const found = orders.find(o => o.id === id);
                return res.status(200).json({ success: !!found, order: found });
            }

            return res.status(200).json({ success: true, orders: orders });
        }
    } catch (error) {
        console.error("Server Proxy Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};