const { StatusCodes } = require('http-status-codes');
const { gameService } = require('../../service');
const { logger } = require('../../utils');

async function getGame(req, res) {
  const { gameUuid } = req.params;
  const { id } = req.user;
  try {
    const result = await gameService.getGame(gameUuid, id);
    return res.status(StatusCodes.OK).send(result);
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.game.controller:getGame, this error ${errorMsg} occurred while trying to get game with uuid: ${gameUuid}`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function listGames(req, res) {
  try {
    const options = req.params;
    const { id } = req.user;
    const result = await gameService.listGames(options, id);
    return res.status(StatusCodes.OK).send(result);
  } catch (error) {
    const errorMsg = error.message || error;
    logger.info(
      `src.api.game.controller:listGames, this error ${errorMsg} occurred while trying to get games.`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

module.exports = {
  listGames,
  getGame
};
