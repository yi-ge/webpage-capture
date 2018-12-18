const axios = require('axios')
const redis = require('./lib/redis')

module.exports = {
  serverConfig: {
    host: 'localhost',
    port: 8088
  },
  application: {
    supersecret: 'j2hd7sjw3ioye5G22'
  },
  redisConfig: { // https://github.com/NodeRedis/node_redis
    host: '127.0.0.1',
    port: 6379,
    family: 'IPv4',
    password: '',
    db: 0
  },
  kueRedisConfig: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 3, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  },
  kueAuthConfig: {
    username: 'yige',
    password: 'fqJ2i736H2jdis'
  },
  kueServerConfig: { // https://nodejs.org/api/net.html#net_server_listen
    host: 'localhost',
    port: 3000
  },
  kueUIConfig: {
    path: '/kue/'
  },
  kueApiConfig: {
    path: '/kue-api'
  },
  proxyIP: {
    async get () {
      const expireTime = await redis.client.getAsync('ip_expire_time')
      if (expireTime === null || Date.parse(expireTime) < (Date.parse(new Date()) - 5000)) {
        const { data } = await axios.get('http://')
        if (data.code === 0) {
          await redis.client.setAsync('ip', data.data[0].ip + ':' + data.data[0].port)
          await redis.client.setAsync('ip_expire_time', data.data[0].expire_time)
          return data.data[0].ip + ':' + data.data[0].port
        }
      } else {
        return redis.client.getAsync('ip')
      }
    }
  }
}
