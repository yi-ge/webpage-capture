const hapi = require('hapi')
const swagger = require('./plugin/swagger')
const { serverConfig } = require('./config')
const routes = require('./routes')
const q = require('./lib/kue')
const snapshot = require('./lib/snapshot')
const kueServer = require('./plugin/kue-server')
const redis = require('./lib/redis')

;(async () => {
  // Create a server with a host and port
  const server = hapi.server(serverConfig)

  await server.register([
    ...swagger
  ])

  // 加载kueAPI及kueUI
  kueServer()

  // Start the server
  try {
    server.route(routes)
    await server.start()
    console.log('Server running at:', server.info.uri)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  q.process('snapshot', 10, async (qjob, qdone) => {
    if (qjob.data.key) {
      q.process(qjob.data.key, 10, async (job, done) => {
        let downloadUrl = ''
        try {
          downloadUrl = await snapshot(job.data.url, job.data.proxy)
        } catch (err) {
          console.log(err)
          done(err)
        }
        
        if (downloadUrl) { 
          try {
            await redis.client.hsetAsync(qjob.data.key, job.data.url, downloadUrl)
            done()
          } catch (err) {
            console.log(err)
            done(err)
          }
        } else { done('没有获取到下载地址') }
      })
      qdone()
    } else {
      qdone('任务异常')
    }
  })
})()
