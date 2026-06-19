import * as winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Production JSON format (Loki/Elasticsearch compatible)
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillWith: ['context', 'traceId', 'spanId', 'userId', 'tenantId', 'requestId'] }),
  winston.format.json()
);

// Development console format
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}] [${info.context || 'System'}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? prodFormat : devFormat,
  }),
];

// File rotation in production/staging
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: prodFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});
