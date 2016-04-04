var config = require('./webpack.config.development.js');
config.entry.shift();
config.plugins.pop();
module.exports = config;
