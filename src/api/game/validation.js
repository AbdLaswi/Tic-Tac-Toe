const { celebrate, Joi, Segments } = require('celebrate');

const paramsValidator = celebrate({
  [Segments.PARAMS]: {
    gameUuid: Joi.string().required().trim().length(32)
  }
});

module.exports = {
  paramsValidator
};
