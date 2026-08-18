module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

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
};