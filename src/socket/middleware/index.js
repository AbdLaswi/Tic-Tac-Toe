const authenticator = require('./authenticator.middleware');
const socketErrorHandler = require('./error-handler.middleware');

module.exports = {
  authenticator,
  socketErrorHandler
};
