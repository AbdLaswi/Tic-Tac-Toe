const { sign } = require('jsonwebtoken');
const { jwt } = require('../config');

module.exports = function generateAccessToken(user) {
  const { id, username } = user;
  const payload = { id, username };

  const options = {
    expiresIn: jwt.tokenExpiration
  };
  return sign(payload, jwt.secret, options);
};
