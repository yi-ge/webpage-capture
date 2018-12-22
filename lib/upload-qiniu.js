const qiniu = require('qiniu')
const uuid = require('uuid/v4')
const { qiniuConfig } = require('../config')

const accessKey = qiniuConfig.accessKey
const secretKey = qiniuConfig.secretKey
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

const options = {
  scope: qiniuConfig.bucket
}
const putPolicy = new qiniu.rs.PutPolicy(options)

const config = new qiniu.conf.Config()
// 空间对应的机房
config.zone = qiniu.zone[qiniuConfig.zone]

var formUploader = new qiniu.form_up.FormUploader(config)
var putExtra = new qiniu.form_up.PutExtra()

var tokenTime = null
var uploadToken = null

function getdate () {
  var date = new Date()
  var mon = date.getMonth() + 1 // getMonth()返回的是0-11，则需要加1
  if (mon <= 9) { // 如果小于9的话，则需要加上0
    mon = '0' + mon
  }
  var day = date.getDate() // getdate()返回的是1-31，则不需要加1
  if (day <= 9) { // 如果小于9的话，则需要加上0
    day = '0' + day
  }
  return date.getFullYear() + '-' + mon + '-' + day
}

module.exports = (localFile) => {
  return new Promise((resolve, reject) => {
    if (tokenTime == null || tokenTime < ((Date.parse(new Date()) - 5000))) {
      uploadToken = putPolicy.uploadToken(mac)
      tokenTime = Date.parse(new Date())
    }

    const key = getdate() + '/' + uuid().replace(/-/g, '') + '.jpg'
    // 文件上传
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr,
      respBody, respInfo) {
      if (respErr) {
        throw respErr
      }
      if (respInfo.statusCode === 200) {
        resolve(qiniuConfig.baseUrl + '/' + respBody.key)
        console.log(respBody)
      } else {
        console.log(respInfo.statusCode)
        console.log(respBody)
        reject(respInfo.statusCode)
      }
    })
  })
}
