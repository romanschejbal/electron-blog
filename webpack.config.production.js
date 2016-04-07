var config = require('./webpack.config.development.js');
config.entry.shift();
config.plugins.shift();
module.exports = config;
