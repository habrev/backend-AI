import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  req.requestId = requestId;
  req.logger = logger.child(requestId);
  
  res.setHeader('X-Request-ID', requestId);
  
  const start = Date.now();
  
  req.logger.info(`${req.method} ${req.originalUrl} - Request started`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      requestId: requestId
    };
    
    if (res.statusCode >= 400) {
      req.logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, logData);
    } else {
      req.logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, logData);
    }
  });
  
  res.on('error', (error) => {
    req.logger.error(`${req.method} ${req.originalUrl} - Request error: ${error.message}`, {
      error: error.stack,
      requestId: requestId
    });
  });
  
  next();
};

export default requestLogger;
