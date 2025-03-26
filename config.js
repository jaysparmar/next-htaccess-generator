const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  buildPath: "./build",
  include404: false,
  outputPath: "./"
};

function readConfig() {
  const configPath = path.join(process.cwd(), 'jay.config.json');

  try {
    let configData = fs.readFileSync(configPath, 'utf8');
    configData = JSON.parse(configData);
    return { ...DEFAULT_CONFIG, ...configData };
  } catch (err) {
    console.error('Error reading config file:', err.message);
    console.log('Using default config.');
    return DEFAULT_CONFIG;
  }
}

module.exports = { readConfig };
