require('dotenv').config();

const config = {
  app: {
    port: process.env.PORT || 3000,
    name: 'Tic-Tac_Toe',
    env: process.env.NODE_ENV
  },
  databases: {
    postgres: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      operatorsAliases: 0,
      define: {
        freezeTableName: true
      }
    }
  },
  jwt: {
    tokenExpiration: process.env.TOKEN_EXPIRATION,
    secret: process.env.SECRET
  },
  bcrypt: {
    salt: Number(process.env.SALT)
  },
  redis: {
    host: process.env.REDIS_HOST,
    userTTL: process.env.USER_TTL,
    gameTTL: process.env.GAME_TTL
  }
};

module.exports = config;
