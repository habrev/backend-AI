import winston from 'winston';
const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack, requestId }) => {
  const requestIdPart = requestId ? `[${requestId}]` : '[NO_ID]';
  const baseMessage = `${timestamp} ${level.toUpperCase()} ${requestIdPart} ${message}`;
  return stack ? `${baseMessage}\n${stack}` : baseMessage;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  defaultMeta: { service: 'backend-api' },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    })
  ]
});

logger.child = (requestId) => {
  return winston.createLogger({
    level: logger.level,
    format: logger.format,
    defaultMeta: { 
      service: 'backend-api',
      requestId: requestId 
    },
    transports: logger.transports
  });
};

export default logger;
