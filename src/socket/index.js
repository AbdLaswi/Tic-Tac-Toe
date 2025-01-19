const { authenticator, socketErrorHandler } = require('./middleware');
const { gameActions } = require('./actions');
const { redis } = require('../lib');
const { logger } = require('../utils');

module.exports = io => {
  io.use(authenticator);

  io.on('connection', socket => {
    const { pubClient } = redis;
    logger.info(`Connection established: ${socket.id}`);

    socketErrorHandler(socket);
    gameActions(socket, io, pubClient);

    socket.on('disconnect', async reason => {
      await pubClient.del(socket.user.id);
      logger.info(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on('connect_error', error => {
      logger.error(`Connection error for socket ${socket.id}: ${JSON.stringify(error)}`);
    });
  });
};
