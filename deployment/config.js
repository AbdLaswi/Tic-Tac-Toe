const { app, databases } = require('../src/config');

const { env } = app;
const { postgres } = databases;

module.exports[env] = postgres;
