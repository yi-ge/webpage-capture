const axios = require('axios')
const redis = require('./lib/redis')

module.exports = {
  serverConfig: {
    host: 'localhost',
    port: 8088
  },
  application: {
    supersecret: 'j2hd7sjw3ioye5G22' // 超级密码
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
    db: 1, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  },
  kueAuthConfig: { // 访问 http://localhost:3000/kue/ 的时候会用到
    username: 'yige',
    password: 'fqJ2i736H2jdis'
  },
  kueServerConfig: { // https://nodejs.org/api/net.html#net_server_listen
    host: 'localhost',
    port: 3000 // 可选。 线上可不开放该端口（http://localhost:3000/kue/ 以及 Kue API 将不可以在公网直接访问），仅用于内部访问也可以。
  },
  kueUIConfig: {
    path: '/kue/'
  },
  kueApiConfig: {
    path: '/kue-api'
  },
  proxyIP: {
    // 设置服务器IP到代理白名单，需自行实现，如果本地服务器IP发生变更，则自动更新到白名单
    async setWhiteList () {
      const { data } = await axios.get('https://ip') // 获取当前服务器IP地址
      const ip = data.ip
      if (ip != oldIp) {
        console.log('检测到服务器IP变更')
        await axios.get('http://xxx.com' + ip)
        oldIp = ip
        axios.get('http://xxx.com' + oldIp)
      }
    },
    // 返回一个用于xx的IP地址（包含端口号），这里可能需要自行实现
    async get (refresh) {
      const expireTime = await redis.client.getAsync('ip_expire_time')
      // if (refresh || expireTime === null || Date.parse(expireTime) - 8 * 3600 < (Date.parse(new Date()) - 5000)) {
      if (refresh || expireTime === null || Date.parse(expireTime) < (Date.parse(new Date()) - 23800)) {
        const { data } = await axios.get('http://xxx')
        if (data.code === 0) {
          await redis.client.setAsync('ip', data.data[0].ip + ':' + data.data[0].port)
          await redis.client.setAsync('ip_expire_time', data.data[0].expire_time)
          return data.data[0].ip + ':' + data.data[0].port
        } else {
          await sleep(930)
          return this.get(true)
        }
      } else {
        return redis.client.getAsync('ip')
      }
    }
  },
  qiniuConfig: {
    // https://portal.qiniu.com/user/key
    accessKey: '',
    secretKey: '',
    bucket: '', // 在 https://portal.qiniu.com/bucket 创建的存储空间名称
    // 机房	Zone对象
    // 华东	qiniu.zone.Zone_z0
    // 华北	qiniu.zone.Zone_z1
    // 华南	qiniu.zone.Zone_z2
    // 北美	qiniu.zone.Zone_na0
    zone: 'Zone_z2',
    baseUrl: 'https://' // 访问域名
  }
}
