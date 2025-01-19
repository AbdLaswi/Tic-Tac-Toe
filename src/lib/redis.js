const { createClient } = require('redis');
const { logger } = require('../utils');

const pubClient = createClient({
  socket: {
    reconnectStrategy: function (retries) {
      if (retries >= 10) {
        logger.warning('too many attempts to reconnect, Redis connection terminated');
        return new Error('too many attempts to reconnect, Redis connection terminated');
      }
      return retries * 500;
    },
    connectTimeout: 1000
  }
});

const subClient = pubClient.duplicate();

Promise.all([(pubClient.connect(), subClient.connect())]).then(() => {
  logger.info('redis pub connection established');
  logger.info('redis sub connection established');
  return Promise.resolve();
});

pubClient.on('error', err => {
  console.error('Redis pubClient error:', err);
});

subClient.on('error', err => {
  console.error('Redis subClient error:', err);
});

module.exports = { subClient, pubClient };
