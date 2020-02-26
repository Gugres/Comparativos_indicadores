class StockModel {
  constructor(container) {
    this.cache = container['app']['cache'];
    this.logger = container['app']['logger'];
    this.amqpPublisher = container['amqp']['publisher'];
    this.pgClient = container['databases']['pg'];
  }

  /**
   * retrieve stock info from db
   * @param {String} stockName stock name
   */
  async getStock(stockName) {
    return await this.cache.get(stockName);
  }
}

module.exports = StockModel;