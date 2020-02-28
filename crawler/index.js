const { join } = require('path');
const createAmqpConnection = require('@gagres/amqp_handler');
const stockCrawl = require('./processors/stockCrawl');

// Pass YAML amqp config file
const amqpConnection = createAmqpConnection(join(__dirname, 'amqp_config.yml'));

// Instantiate processors
amqpConnection.dependencyInjector.factory('stockCrawl', () => stockCrawl);

// Initialize amqp queue consumer
amqpConnection.bootstrapAmqpApp();