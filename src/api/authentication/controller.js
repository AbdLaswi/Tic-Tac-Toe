const { StatusCodes } = require('http-status-codes');
const { authService } = require('../../service');
const { logger, tokenGenerator } = require('../../utils');

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const createdUser = await authService.login(email.trim(), password);

    if (!createdUser) {
      logger.info(`src.api.authentication:login, access token is denied for email: ${email}`);
      return res.status(StatusCodes.BAD_REQUEST).send('email or password is incorrect');
    }
    const accessToken = tokenGenerator(createdUser);

    return res.status(StatusCodes.OK).send({ accessToken });
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.authentication:login, this error ${errorMsg} wile trying to login for email: ${email}`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

module.exports = {
  login
};
