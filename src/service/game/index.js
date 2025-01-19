const { Game, GamePlayer } = require('../../model');
const { Op } = require('sequelize');

async function createGame(game) {
  return Game.create(game);
}

async function getGame(id, options) {
  const where = options ? { ...options, id } : { id };
  return Game.findOne({
    where,
    attributes: {
      exclude: ['deletedAt']
    },
    raw: true
  });
}

async function getUserGame(id, userId) {
  return Game.findOne({
    where: {
      id
    },
    attributes: {
      exclude: ['deletedAt']
    },
    include: {
      model: GamePlayer,
      attributes: [],
      where: {
        [Op.or]: [{ firstPlayerId: userId }, { secPlayerId: userId }]
      }
    },
    raw: true
  });
}

async function listUserGames(options, userId) {
  return Game.findAndCountAll({
    ...options,
    attributes: {
      exclude: ['deletedAt']
    },
    include: {
      model: GamePlayer,
      attributes: [],
      where: {
        [Op.or]: [{ firstPlayerId: userId }, { secPlayerId: userId }]
      }
    },
    raw: true
  });
}

async function updateGame(id, game) {
  return Game.update(
    {
      ...game
    },
    {
      where: {
        id
      }
    }
  );
}

module.exports = {
  listUserGames,
  getUserGame,
  createGame,
  updateGame,
  getGame
};
