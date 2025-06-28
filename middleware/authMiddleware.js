const jwt = require('jsonwebtoken');

function authMiddleware (req, res, next) {
  const headers = req.headers.authorization 
  const token= headers.split(' ')[1]  
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch(err) {
      res.status(401).json({ message: 'Token is not valid' })
    }
   
  };

  module.exports = authMiddleware