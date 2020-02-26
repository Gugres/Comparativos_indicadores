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
  const controllers = container['controllers'];
  const validateMiddleware = container['middlewares']['validate'];

  app.get('/stock/:stock', validateMiddleware.validate(getStockSchema), controllers['stock'].getStock);
}