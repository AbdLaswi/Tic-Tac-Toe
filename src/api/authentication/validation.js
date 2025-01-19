const { celebrate, Joi, Segments } = require('celebrate');

const loginValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] }
      })
      .trim()
      .required(),
    password: Joi.string().min(8)
  })
});

module.exports = {
  loginValidator
};
