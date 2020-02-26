const fs = require('fs');
const { join } = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // Módulo que lida com algumas vúlnerabilidades básicas de requisições
const cors = require('cors'); // Habilita Cross-Origin
const morgan = require('morgan'); // Logging request info

module.exports = (app) => {
  const whiteList = ['http://localhost:80'];

  // CORS config
  app.use(cors({
    origin: (origin, callback) => {
      // if (whiteList.indexOf(origin) !== -1) {
      //   callback(null, true);
      // } else {
      //   callback(new Error('Not allowed by CORS'));
      // }
      callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  }));

  const accessLogStream = fs.createWriteStream(join(__dirname, '..', 'tmp/logs', 'access.log'), { flags: 'a' });

  app.use(morgan('dev'));
  app.use(morgan('combined', {
    stream: accessLogStream
  }));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
};
