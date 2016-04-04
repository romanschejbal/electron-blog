var config = require('./webpack.config.development.js');
config.entry.shift();
module.exports = config;
