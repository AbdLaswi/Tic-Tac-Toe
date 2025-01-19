const createError = (defaultMessage, message, statusCode, extra = {}) => ({
  message: message || defaultMessage,
  statusCode,
  extra
});

const unauthenticatedError = (message, extra) =>
  createError('Unauthenticated', message, 401, extra);

const badRequestError = (message, extra) => createError('Bad Request', message, 400, extra);

const notFoundError = (message, extra) => createError('Not Found', message, 404, extra);

const internalError = (message, extra) => createError('Internal Server Error', message, 500, extra);

module.exports = {
  unauthenticatedError,
  badRequestError,
  notFoundError,
  internalError
};
