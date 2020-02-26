class StockController {
  constructor(container) {
    this.logger = container['app']['logger'];
    this.stockModel = container['models']['stock'];
  }

  getStock(req, res) {
    const { stock } = req.params;
    this.stockModel.getStock(stock)
      .then((stockInfo) => {
        res.send(`Stock info: ${stockInfo}`);
      })
      .catch((err) => {
        res.send(err);
      });
  }
}

module.exports = StockController;