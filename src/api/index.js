const { Router } = require('express');
const { errors } = require('celebrate');

const authentication = require('./authentication');
const { authenticator } = require('./middleware');
const healthcheck = require('./health-check');
const game = require('./game');
const user = require('./user');

const router = Router();

router.use('/authentication', authentication);
router.use('/game', authenticator, game);
router.use('/healthcheck', healthcheck);
router.use('/user', user);

router.use(errors());

module.exports = router;
