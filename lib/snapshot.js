const puppeteer = require('puppeteer')
const uuid = require('uuid/v4')
const path = require('path')
const fs = require('fs')
const getProxyIP = require('../plugin/proxy-ip')
const uploadToQiniu = require('./upload-qiniu')
const os = require('os')

process.setMaxListeners(11)

// puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')({
//   makeWindows: true
// }))
// puppeteer.use(require('puppeteer-extra-plugin-stealth')())

const snapshot = async (url, proxy, replace, two) => {
  let proxyIP = ''
  if (proxy) { proxyIP = proxy[0] } else { proxyIP = await getProxyIP(replace) }

  console.log('当前代理IP：' + proxyIP)

  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--headless',
    '--disable-gpu',
    '--window-size=1024x768'
  ]

  const config = {
    args,
    ignoreHTTPSErrors: true
  }

  if (proxyIP) { args.push('--proxy-server=socks5://' + proxyIP) }

  if (os.arch() === 'arm') { config.executablePath = '/usr/bin/chromium-browser' }

  const browser = await puppeteer.launch(config)

  var page = await browser.newPage()

  page.setViewport({
    width: 1024,
    height: 768
  })

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36')

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
  } catch (err) {
    if (err.message.includes('ERR_CONNECTION_RESET') || err.message.includes('ERR_NO_SUPPORTED_PROXIES')) {
      console.log('无法访问：', err.message)
      if (two) { return null } else { return snapshot(url, proxy, true, true) }
    } else {
      await browser.close()
      // await page.close()
      console.log('发生错误：', err.message)
      console.log('已经重新执行：', url)
      return snapshot(url, proxy, true)
    }
  }

  const saveUrl = path.join(__dirname, '../tmp', uuid().replace(/-/g, '') + '.jpg')

  try {
    await page.screenshot({
      type: 'jpeg',
      path: saveUrl,
      fullPage: true
    })
  } catch (err) {
    console.log(err)
    return null
  }

  await browser.close()
  // await page.close()

  console.log('完成快照：', url)

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

module.exports = snapshot
