const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const dashLog = new DailyRotateFile({
  filename: "./logs/dash-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  zippedArchive: true,
  maxSize: "20m",
});

const dash = winston.createLogger({
  transports: [
    dashLog,
    new winston.transports.Console({
      colorize: true,
    }),
  ],
});

module.exports = {
  dashLogger: dash
};
