const { sequelize, DataTypes } = require('./sequelize');
const GamePlayer = require('./game-player.model');
const Game = require('./game.model');
const User = require('./user.model');

const models = {
  GamePlayer: GamePlayer(sequelize, DataTypes),
  Game: Game(sequelize, DataTypes),
  User: User(sequelize, DataTypes)
};

Object.keys(models).forEach(modelName => {
  const model = models[modelName];
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
