const { Pool } = require('pg');

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

module.exports = async (dependencyInjector) => {
  const postgresClient = await connectPostgres();
  dependencyInjector.factory('databases.pg', () => postgresClient);
}