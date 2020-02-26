class StockController {
  constructor(container) {
    this.logger = container['appLogger'];
  }

  getStock(req, res) {
    const { stock } = req.params;
  }
}

module.exports = StockController;