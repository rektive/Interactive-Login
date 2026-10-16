const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------
// JWT Authentication Routes
// ----------------------------------------------------

// 1. Login Endpoint: Creates and signs a JWT, stores it in an HTTP-only cookie
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Mock credential check (accepts any password with 3+ chars for testing)
    if (password.length < 3) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Password too short.' });
    }

    // Payload stored inside the JWT
    const payload = {
        username: username,
        loginTime: new Date().toISOString()
    };

    // Sign the token (valid for 1 hour)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Send token inside a secure, HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour in ms
    });

    return res.json({
        success: true,
        message: 'Authenticated successfully!',
        user: { username }
    });
});

// 2. Verification Endpoint: Verifies the JWT from the cookie
app.get('/api/verify', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ authenticated: false, message: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ authenticated: true, user: decoded });
    } catch (err) {
        return res.status(401).json({ authenticated: false, message: 'Token is invalid or expired.' });
    }
});

// 3. Logout Endpoint: Clears the JWT cookie
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully.' });
});

app.listen(PORT, () => {
    console.log(`Login Stage live at: http://localhost:${PORT}`);
});

// For vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Login Stage live at: http://localhost:${PORT}`);
    });
}

// Export for Vercel:
module.exports = app;