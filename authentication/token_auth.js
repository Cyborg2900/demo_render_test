const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
  const token=req.body.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token not found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.body.email = user.email;
    next();
  });
}

module.exports = authenticateToken;
