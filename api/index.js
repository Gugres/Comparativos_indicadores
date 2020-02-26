const { join } = require('path');
const Bottle = require('bottlejs');
const express = require('express');
const configDatabases = require('./config/databases');
const configExpress = require('./config/express');
const configEnviroment = require('./config/environment');
const createLogger = require('./logger');
const createRoutes = require('./routes');
const {
  generateDependencies
} = require('./utils/index');

const dependencyInjector = new Bottle();
const app = express();

const appLogger = createLogger('api_default_logger', {
  level: 'debug',
  path: join(__dirname, 'tmp/logs' )
});

dependencyInjector.factory('app', () => app);
dependencyInjector.factory('app.logger', () => appLogger);

configExpress(app); // Initialize express config
configEnviroment(); // Initialize environment config

configDatabases(dependencyInjector)
  .then(() => {
    generateDependencies(join(__dirname, 'controllers'), 'controllers', dependencyInjector); // Initialize controllers
    generateDependencies(join(__dirname, 'models'), 'models', dependencyInjector); // Initialize controllers
    generateDependencies(join(__dirname, 'middlewares'), 'middlewares', dependencyInjector); // Initialize middlewares

    createRoutes(app, dependencyInjector.container) // Initialize routes

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      appLogger.debug(`Initialized api on port: ${PORT}`);
    });
  })
  .catch((err) => {
    appLogger.error(err);
    process.exit(-1);
  });