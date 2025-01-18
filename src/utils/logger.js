const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf } = format;

const logger = createLogger({
  levels: loggerLevels(),
  format: combine(colorize(), timestamp(), formatter()),

  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log', level: 'info' }),
    new transports.File({ filename: 'logs/combined.log', level: 'warning' })
  ]
});

function formatter() {
  const specialFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`;
  });

  return specialFormat;
}
function loggerLevels() {
  return {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  };
}

module.exports = logger;
