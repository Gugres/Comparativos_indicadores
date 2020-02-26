const redis = require('redis');

class Cache {
  /**
   * @constructor
   * @param {redis.RedisClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Promisify callback functions
   * @param {Function} fn function to be executed
   * @param {any} args args to the function
   */
  promisify(fn, ...args) {
    return new Promise((res, rej) => {
      fn.bind(this.client)(...args, (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    })
  }

  /**
   * get key on cache memory
   * @param {String} key
   */
  get(key) {
    return this.promisify(this.client.get, key);
  }
}

/**
 * @returns {Cache} Cache instance
 */
module.exports = () => {
  const {
    REDIS_HOST, REDIS_PORT, REDIS_PASS
  } = process.env;

  const client = redis.createClient({
    host: REDIS_HOST,
    password: REDIS_PASS,
    port: REDIS_PORT
  });

  return new Promise((resolve, reject) => {
    client.on('error', reject);
    client.on('ready', () => resolve(new Cache(client)))
  });
}