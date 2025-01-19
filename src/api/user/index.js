const { Router } = require('express');
const { authenticator } = require('../middleware');
const { getUser, createUser, listUsers } = require('./controller');
const { paramsValidator, createUserValidator } = require('./validation');

const router = Router();

router.get('/:userUuid', authenticator, paramsValidator, getUser);
router.get('/', authenticator, listUsers);
router.post('/', createUserValidator, createUser);

module.exports = router;
