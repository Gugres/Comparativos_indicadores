const { join } = require('path');
const dotenv = require('dotenv');

module.exports = () => {
  let envFile = '';
  switch(process.env.NODE_ENV) {
    case 'dev':
    case 'development':
    default:
      envFile += '.dev';
      break;
  }

  dotenv.config({
    path: join(__dirname, '../', `${envFile}.env`)
  });
}