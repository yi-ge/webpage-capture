const puppeteer = require('puppeteer-extra')

puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')({
  makeWindows: true
}))
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

module.exports = (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true
  })
  const page = await browser.newPage()
  page.setViewport({
    width: 1024,
    height: 768
  })
  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  })
  await page.screenshot({
    type: 'jpeg',
    path: 'example.jpg',
    fullPage: true
  })

  await browser.close()
}
