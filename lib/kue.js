const kue = require('kue')
const {
  kueRedisConfig
} = require('../config')

// console.log(kueRedisConfig)

var q = kue.createQueue({
  prefix: 'q',
  redis: kueRedisConfig
})

module.exports = q
