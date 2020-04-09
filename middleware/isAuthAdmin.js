const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  let token = req.headers.authorization;
  // Check is user is an admin after signed in
  if (token) {
    token = token.split(' ')[1];
    jwt.verify(token, 'this is my jwt secret, nice right?', (err, decodedToken) => {
      if (err) {
        res.status(500).json({ msg: "Invalid Token" });
        next(err);
      } else {
        // console.log(decodedToken)        
        if (decodedToken.role.toLowerCase() === 'admin') {
          next();
        } else {
          res.status(401).json({ msg: "You don't have the right access" });
          next(err);
        }
      }
    });
  } else {
    res.status(500).json({ msg: "Unauthorized" });
  }
}