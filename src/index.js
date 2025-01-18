const express = require('express');
const { json } = require('body-parser');
const { ip } = require('address');
const cors = require('cors');

const { logger } = require('./utils');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(json());

const { port } = config.app;

app.listen(port, () => {
  logger.info(`server is up, http://${ip()}:${port}/api/v1`);
});
