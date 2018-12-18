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
  }
}
