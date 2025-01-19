const { celebrate, Joi, Segments } = require('celebrate');

const createUserValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().min(4).max(60).trim().required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ['com', 'net']
        }
      })
      .trim()
      .required(),
    phone: Joi.string().min(10).max(13).required(),
    password: Joi.string().min(8)
  })
});

const paramsValidator = celebrate({
  [Segments.PARAMS]: {
    userUuid: Joi.string().required().trim().length(32)
  }
});

module.exports = {
  createUserValidator,
  paramsValidator
};
