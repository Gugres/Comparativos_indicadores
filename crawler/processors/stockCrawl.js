const fs = require('fs');
const { crawlStock } = require('../utils/crawl');

class StockCrawlProcessor {
  constructor(container) {
    this.amqpLogger = container['amqp_logger'];
    this.publisher = container['publisher'];
  }

  /**
   * process message
   * @param {Object} messageData Message data property
   */
  async process(message) {
    const { data: messageData } = message.content;

    let dadosColetados = [];
    if (Array.isArray(messageData) && messageData.length > 0  ) {
      dadosColetados = await this.getStockInfo(messageData);
      this.sendStockInfo(dadosColetados, message.fields);
    } else {
      throw new Error(`list of stock's names required`);
    }
  }

  /**
   * crawl stock on fundamentus.com.br and get stock info
   * @param {String[]} stockList stock list
   */
  async getStockInfo(stockList) {
    return await crawlStock(stockList, this.amqpLogger);
  };

  /**
   * send stock info on rabbitmq
   * @param {Object} stockInfo stock info
   */
  sendStockInfo(stockInfo, fields) {
    this.amqpLogger.debug(`sending stock info`);
    this.publisher.publish(`${fields['routingKey']}.result`, stockInfo);
  }
}

let stockCrawlInstance;
module.exports = (container) => {
  if (!stockCrawlInstance) {
    stockCrawlInstance = new StockCrawlProcessor(container);
  }

  return stockCrawlInstance;
};