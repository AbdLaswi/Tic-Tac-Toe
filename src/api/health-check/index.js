const { Router } = require('express');
const { StatusCodes } = require('http-status-codes');

const router = Router();

router.get('/', (req, res) => {
  return res.status(StatusCodes.OK).send('server is up');
});

module.exports = router;
