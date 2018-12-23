const q = require('../lib/kue')
const snapshot = require('../lib/snapshot')
const redis = require('../lib/redis')

module.exports = () => {
  q.process('snapshot', 1, async (qjob, qdone) => {
    if (qjob.data.key) {
      q.process(qjob.data.key, 1, async (job, done) => {
        let downloadUrl = ''
        try {
          downloadUrl = await snapshot(job.data.url, job.data.proxy)
        } catch (err) {
          console.log('执行快照发生错误：')
          console.log(err)
          done(err)
        }

        if (downloadUrl) {
          try {
            await redis.client.hsetAsync(qjob.data.key, job.data.url, downloadUrl)
            console.log('完成任务：', job.data.url, downloadUrl)
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
}
