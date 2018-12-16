const hapi = require('hapi')
const swagger = require('./plugin/swagger')
const { serverConfig } = require('./config')
const routes = require('./routes')
const q = require('./lib/kue')
const snapshot = require('./lib/snapshot')

;(async () => {
  // Create a server with a host and port
  const server = hapi.server(serverConfig)

  await server.register([
    ...swagger
  ])

  // Start the server
  try {
    server.route(routes)
    await server.start()
    console.log('Server running at:', server.info.uri)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  q.process('snapshot', 10, async (job, done) => {
    const downloadUrl = await snapshot(job.data.url)
    if (downloadUrl)
      done()
    else 
      down('没有获取到下载地址')
  });
})()
