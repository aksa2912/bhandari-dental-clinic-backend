const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super-secret-key-change-in-production';

const requireAdmin = (req, res, next) => {
  // The token is inside the cookie, which cookie-parser parses for us
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // Attach user info to the request
    next(); // Tell Express to proceed to the actual route
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { requireAdmin };