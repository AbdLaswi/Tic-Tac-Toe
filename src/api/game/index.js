const { Router } = require('express');
const { getGame, listGames } = require('./controller');
const { paramsValidator } = require('./validation');
const { authenticator } = require('../middleware');

const router = Router();

router.get('/:gameUuid', authenticator, paramsValidator, getGame);
router.get('/', authenticator, listGames);

module.exports = router;
