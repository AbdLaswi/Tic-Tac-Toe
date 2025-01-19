const { StatusCodes } = require('http-status-codes');
const { verify } = require('jsonwebtoken');
const { jwt } = require('../../config');
const { userService } = require('../../service');
const { logger } = require('../../utils');

async function authenticator(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(StatusCodes.UNAUTHORIZED).send();

  const token = authorization.split(' ')[1];
  try {
    req.token = verify(token, jwt.secret);
    req.user = await userService.getUser(req.token.id);
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).send();
    return next();
  } catch (error) {
    const errorMsg = error.message || error;
    logger.warning(
      `this token: ${JSON.stringify(
        token
      )} is trying to access our system, and it gets rejected for this reason: ${errorMsg}`
    );
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }
}

module.exports = authenticator;
