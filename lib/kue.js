const kue = require('kue');
const {
  kueRedisConfig
} = require('../config')

var q = kue.createQueue({
  prefix: 'q',
  redis: kueRedisConfig
});

module.exports = q