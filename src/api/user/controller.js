const { StatusCodes } = require('http-status-codes');
const { hash } = require('bcrypt');
const { userService } = require('../../service');
const { logger, tokenGenerator } = require('../../utils');
const { bcrypt } = require('../../config');

async function getUser(req, res) {
  const { userUuid } = req.params;
  try {
    const result = await userService.getExposedUser(userUuid);
    return res.status(StatusCodes.OK).send(result);
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.user.controller:getUser, this error ${errorMsg} occurred while trying to get user with uuid: ${userUuid}`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function listUsers(req, res) {
  try {
    const options = req.params;
    const result = await userService.listUsers(options);
    return res.status(StatusCodes.OK).send(result);
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.user.controller:getUser, this error ${errorMsg} occurred while trying to list users`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function createUser(req, res) {
  const user = req.body;
  try {
    user.password = await hash(user.password, bcrypt.salt);
    const createdUser = await userService.createUser(user);
    const token = tokenGenerator(createdUser);
    return res.status(StatusCodes.CREATED).send(token);
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.user.controller:getUser, this error ${errorMsg} occurred while trying to create user`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

module.exports = {
  createUser,
  listUsers,
  getUser
};
