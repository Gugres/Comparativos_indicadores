const { join } = require('path');
const bunyan = require('bunyan');

function createLogger(loggerName, { path, level } = {}) {
  let devStream = [];
  if (process.env.NODE_ENV !== 'production') {
    devStream.push({ level, stream: process.stdout });
  }
  const logger = bunyan.createLogger({
    name: loggerName,
    streams: [
      ...devStream,
      { level, path: join(path, 'api.log') },
    ]
  });

  return logger;
}

module.exports = createLogger;