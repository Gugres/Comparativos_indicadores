const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

async function connectPostgres() {
  const {
    PG_HOST, PG_USER, PG_PASS, PG_DB, PG_PORT
  } = process.env;

  const pool = new Pool({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASS,
    database: PG_DB,
  });

  // the pool will emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  pool.on('error', (err) => {
    throw err;
  })

  return pool.connect();
}

async function connectMongo() {
  const {
    MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASS, MONGO_DB
  } = process.env;

  const url = `mongodb://${MONGO_HOST}:${MONGO_PORT}`;
  const mongoClient = new MongoClient(url, {
    auth: {
      user: MONGO_USER,
      password: MONGO_PASS
    }
  });

  return mongoClient.connect()
    .then((client) => client.db(MONGO_DB));
}

module.exports = async (dependencyInjector) => {
  const postgresClient = await connectPostgres();
  const mongoDb = await connectMongo();
  dependencyInjector.factory('databases.pg', () => postgresClient);
  dependencyInjector.factory('databases.mongo', () => mongoDb);
}