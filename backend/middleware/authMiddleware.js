const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../models')

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  // req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

  if (!token) {
    req.flash('error', 'No token, authorization denied');
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      req.flash('error', 'Authorization denied, user not found');
      return res.redirect('/login');
    }
    req.user = user;
    next();
  } catch (error) {
    req.flash('error', 'Token is not valid');
    res.redirect('/login');
  }
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    req.flash('error', 'Authorization denied, insufficient privileges');
    return res.redirect('/');
  }
  next();
};

module.exports = {
  authMiddleware,
  checkRole
};
