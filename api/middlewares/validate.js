const Joi = require('joi');

class RequestValidatorMiddleware {
  constructor(container) {
    this.logger = container['app']['logger'];
  }

  validate(rules) {
    return (req, res, next) => {
      let error = false;
      let result = null;

      for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];
        this.logger.debug(`validate field: ${rule.field}`);

        result = Joi.validate(req[rule.field], rule.schema);
        if (result.error !== null) {
          error = true;
          break;
        }
      }

      if (error === true) {
        return res.status(422).send({ message: 'Invalid parameters', err: result.error });
      }

      return next();
    }
  }
}

module.exports = RequestValidatorMiddleware;
