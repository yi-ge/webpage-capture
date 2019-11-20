const redis = require('redis')
const {
  redisConfig
} = require('../config.js')
const bluebird = require('bluebird')

bluebird.promisifyAll(redis)

// console.log(redisConfig)

const client = redis.createClient(redisConfig)

module.exports = {
  client
}
