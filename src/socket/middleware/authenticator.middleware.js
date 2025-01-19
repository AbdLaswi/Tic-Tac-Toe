const { verify } = require('jsonwebtoken');
const { userService } = require('../../service');
const { logger, error } = require('../../utils');
const { redis } = require('../../lib');
const {
  jwt,
  redis: { userTTL }
} = require('../../config');

async function authenticator(socket, next) {
  const { token } = socket.handshake.auth;
  const { pubClient } = redis;
  if (!token) return next(error.unauthenticatedError('Authentication error: Token is required'));
  try {
    const verifiedToken = verify(token, jwt.secret);
    const user = await userService.getUser(verifiedToken.id);
    if (!user)
      return next(
        error.unauthenticatedError('Authentication error: Token is assigned to unknown user')
      );

    socket.user = user;
    await pubClient.set(`User_${user.id}`, socket.id, {
      EX: userTTL
    });

    return next();
  } catch (err) {
    const errorMsg = err.message || err;
    logger.warning(
      `this token: ${JSON.stringify(
        token
      )} is trying to access our system, and it gets rejected for this reason: ${errorMsg}`
    );
    return next(error.unauthenticatedError('Authentication error: Token is required'));
  }
}

module.exports = authenticator;
