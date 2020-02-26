const Joi = require('joi');

const getStockSchema = [
  {
    field: 'params',
    schema: Joi.object({
      stock: Joi.string().required()
    })
  }
];

module.exports = (app, container) => {
  const validateMiddleware = container['middlewares']['validate'];
  const stockController = container['controllers']['stock'];

  app.get('/stock/:stock', validateMiddleware.validate(getStockSchema), stockController.getStock.bind(stockController));
}