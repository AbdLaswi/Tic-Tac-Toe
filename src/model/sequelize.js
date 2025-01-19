const { Sequelize, DataTypes } = require('sequelize');
const { logger } = require('../utils');
const config = require('../config');
const {
  databases: { postgres }
} = config;

const { database, username, password } = postgres;

const sequelize = new Sequelize(database, username, password, { ...postgres });

try {
  sequelize.authenticate().then(() => {
    sequelize.sync();
    logger.info('Connection has been established successfully.');
  });
} catch (error) {
  logger.info('Unable to connect to the database:', error);
}

module.exports = { sequelize, DataTypes };
