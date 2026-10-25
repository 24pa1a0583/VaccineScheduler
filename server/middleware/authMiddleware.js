const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vaccine_scheduler_default_jwt_secret_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please sign in again.' });
  }
}

module.exports = {
  verifyToken,
  JWT_SECRET
};
