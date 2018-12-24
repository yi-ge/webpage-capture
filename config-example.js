const axios = require('axios')
const redis = require('./lib/redis')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let oldIps = []

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
    // 返回一个用于xx的IP地址（包含端口号），这里可能需要自行实现
    async get (refresh) {
      const expireTime = await redis.client.getAsync('ip_expire_time')
      if (refresh || expireTime === null || Date.parse(expireTime) < (Date.parse(new Date()) - 23800)) {
        const { data } = await axios.get('http://getip')
        if (data.code === 0) {
          await redis.client.setAsync('ip', data.data[0].ip + ':' + data.data[0].port)
          await redis.client.setAsync('ip_expire_time', data.data[0].expire_time)
          return data.data[0].ip + ':' + data.data[0].port
        } else if (data.code === 113) { // 服务器IP地址变更
          try {
            const ips = []
            const ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(data.msg)[0]
            ips.push(ip)
            const r = await axios.get('https://ip')
            if (r.data.ip && r.data.ip !== ip) { ips.push(r.data.ip) }
            console.log('服务器IP地址发生变更：')
            console.log('    老IP', oldIps.join(','))
            console.log('    新IP', ips.join(','))
            await axios.get('https://xxx.com?white=' + ips.join(','))
            axios.get('https://xxx.com?white=' + oldIps.join(','))
            oldIps = ips
          } catch (err) {
            console.log(err)
          }
          return this.get(true)
        } else if (data.code === 111) { // 请求频繁
          await sleep(980)
          return this.get(true)
        } else { // 未知异常
          await sleep(3000)
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
