const puppeteer = require('puppeteer-extra')
const uuid = require('uuid/v4')
const path = require('path')
const fs = require('fs')
const getProxyIP = require('../plugin/proxy-ip')
const uploadToQiniu = require('./upload-qiniu')

puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')({
  makeWindows: true
}))
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

module.exports = async (url, proxy) => {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]

  if (proxy) { args.push('--proxy-server=' + proxy[0]) } else {
    const ip = await getProxyIP()
    args.push('--proxy-server=' + ip)
  }

  const browser = await puppeteer.launch({
    args,
    ignoreHTTPSErrors: true,
    headless: true
  })

  var page = await browser.newPage()

  page.setViewport({
    width: 1024,
    height: 768
  })

  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  })

  const saveUrl = path.join(__dirname, '../tmp', uuid().replace(/-/g, '') + '.jpg')

  await page.screenshot({
    type: 'jpeg',
    path: saveUrl,
    fullPage: true
  })

  await browser.close()

  // TODO: 上传到百度网盘、-七牛-(七牛已实现)
  try {
    const downloadUrl = await uploadToQiniu(saveUrl)

    if (downloadUrl) {
      fs.unlink(saveUrl, (e) => { // 如果上传成功，则异步删除本地的文件
        if (e) console.log(e)
      })
      return downloadUrl
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}
