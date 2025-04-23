import playwright from 'playwright';
import { processEnv } from './processEnv.js';

let matchIds: string[] = [];

const collectIds = async () => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`${processEnv().SCRAPE_SOURCE_02}`, { waitUntil: 'domcontentloaded' });

  const linksElements = await page.$$('.Match-module_score__5Ghhj');

  const tomorrowElement = page.getByText('Tomorrow', { exact: true });
  await tomorrowElement.click();

  await page.waitForTimeout(20000);

  const links = [];

  for (const element of linksElements) {
    const href = await element.getAttribute('href');
    if (href) {
      // Replace '/show/' with '/teamstatistics/' in the href
      const updatedHref = href.replace('/show/', '/teamstatistics/');
      links.push(`${processEnv().SCRAPE_SOURCE_02}${updatedHref}`);
    }
  }

  console.log(links);

  // // await page.locator('.webpush-swal2-close').waitFor();
  // // await page.locator('.webpush-swal2-close').click();
  // const previews = await page.$$('.Match-module_previewBtn__mYHIm');

  // for (const preview of previews) {
  //   const id = (await preview.getAttribute('id')) ?? '';
  //   matchIds.push(id.slice(11));

  //   // Go to match preview and collect predictions
  //   await preview.click();

  //   // // Enable request interception
  //   // await page.route('**/*.js', (route) => {
  //   //   if (route.request().url().includes('cdn')) {
  //   //     // Skip loading the match-facts script
  //   //     route.abort();
  //   //   } else {
  //   //     // Allow other scripts to load
  //   //     route.continue();
  //   //   }
  //   // });
  //   // await page.waitForTimeout(6000000)

  //   await page.waitForSelector('#match-header', { state: 'visible' });

  //   console.log('here again_01')
  //   const homePrediction = await page.locator('#preview-prediction .home .predicted-score').innerText();
  //   const awayPrediction = await page.locator('#preview-prediction .away .predicted-score').innerText();

  //   console.log(`Home: ${homePrediction} || Away: ${awayPrediction}`);
  //   await page.goBack();

  //   const updatedPreviews = await page.$$('.Match-module_previewBtn__mYHIm');
  //   previews.length = 0;
  //   previews.push(...updatedPreviews);
  // }
};
collectIds();
