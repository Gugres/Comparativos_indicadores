const { join } = require('path');
const createAmqpConnection = require('amqp_handler');

module.exports = async (dependencyInjector) => {
  const amqpConnection = createAmqpConnection(join(__dirname, '../', 'amqp_config.yml'));

  await amqpConnection.bootstrapAmqpApp();

  dependencyInjector.factory('amqp.publisher', () => amqpConnection.dependencyInjector.container['publisher']);
}