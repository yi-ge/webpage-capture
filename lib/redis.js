const redis = require("redis")
const {
  redisConfig
} = require('../config')
const bluebird = require('bluebird')

bluebird.promisifyAll(redis);

const client = redis.createClient(redisConfig);

module.exports = {
  client
}