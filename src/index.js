const { createAdapter } = require('@socket.io/redis-adapter');
const { Server } = require('socket.io');
const express = require('express');
const { ip } = require('address');
const cors = require('cors');
const http = require('http');

const { logger } = require('./utils');
const { redis } = require('./lib');
const realtime = require('./socket');
const config = require('./config');
const api = require('./api');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', api);

const { port } = config.app;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  },
  transports: ['websocket', 'polling']
});

io.adapter(createAdapter(redis.pubClient, redis.subClient));

realtime(io);

server.listen(port, () => {
  logger.info(`Server is up, http://${ip()}:${port}/api/v1`);
});
