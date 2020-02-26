const fs = require('fs');
const { join } = require('path');

function generateDependencies(dirPath, dependencyName, dependencyInjector) {
  const dirFiles = fs.readdirSync(join(dirPath));

  if (Array.isArray(dirFiles) && dirFiles.length > 0) {
    for(const file of dirFiles) {
      const filename = file.replace('.js', '');
      const dependencyClass = require(join(dirPath, file));
      dependencyInjector.factory(`${dependencyName}.${filename}`, () => {
        return new dependencyClass(dependencyInjector.container);
      });
    }
  }
}

module.exports = {
  generateDependencies
}