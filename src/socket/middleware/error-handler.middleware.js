const { logger } = require('../../utils');

const socketErrorHandler =
  (socket, emitEvent = 'error') =>
  error => {
    const response = {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      extra: error.extra || {}
    };

    socket.emit(emitEvent, response);
    logger.error('Socket Error:', response);
  };

module.exports = socketErrorHandler;
