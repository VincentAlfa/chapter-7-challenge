import jwt from 'jsonwebtoken';

export const restrict = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = decoded;
    next();
  });
};
