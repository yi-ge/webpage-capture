const puppeteer = require('puppeteer-extra')

puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')({ makeWindows: true }))
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

;(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: true});
  const page = await browser.newPage();
  page.setViewport({
    width: 1024,
    height: 768
  });
  await page.goto('http://www.landchina.com/default.aspx?tabid=386&comname=default&wmguid=75c72564-ffd9-426a-954b-8ac2df0903b7&recorderguid=3ef88a69-198e-4e94-8352-6a90ece0d2a9', {waitUntil: 'domcontentloaded'});
  await page.screenshot({type: 'jpeg', path: 'example.jpg', fullPage: true});

  await browser.close();
})();