import playwright from 'playwright';
import { processEnv } from './processEnv.js';

let matchIds:string[] = [];

const collectIds = async () => {
  const browser = await playwright.chromium.launch({
    headless: true // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`${processEnv().SCRAPE_SOURCE_02}`);
  await page.locator('.webpush-swal2-close').waitFor();
  await page.locator('.webpush-swal2-close').click();
  const previews = await page.$$('.Match-module_previewBtn__mYHIm');

  for (const preview of previews) {
    const id = await preview.getAttribute('id') ?? '';
    matchIds.push(id.slice(11));

    // Go to match preview and collect predictions
    await preview.click();
    await page.waitForSelector('#match-header', { state: 'visible' });

    const homePrediction = await page.locator('.preview-prediction .home .predicted-score').innerText();
    const awayPrediction = await page.locator('.preview-prediction .away .predicted-score').innerText();

    console.log(`Home: ${homePrediction} || Away: ${awayPrediction}`);
    await page.goBack();

    const updatedPreviews = await page.$$('.Match-module_previewBtn__mYHIm');
    previews.length = 0;
    previews.push(...updatedPreviews);
  }

  console.log(matchIds);
};
collectIds();
