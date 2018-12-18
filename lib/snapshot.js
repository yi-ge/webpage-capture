const puppeteer = require('puppeteer-extra')
const uuid = require('uuid/v4')
const path = require('path')

puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')({
  makeWindows: true
}))
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

module.exports = async (url, proxy) => {
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ]

  if (proxy)
    args.push("--proxy-server=" + proxy)

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

  // TODO: 上传到百度网盘、七牛

  return saveUrl
}
