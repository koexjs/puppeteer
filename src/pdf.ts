import { Context } from '@koex/core';
import * as puppeteer from 'puppeteer';
import md5 from '@zodash/md5';

import { getConfig } from './utils';

export async function pdf(ctx: Context) {
  const url: string = getConfig(ctx, 'url', true);
  const format: string = getConfig(ctx, 'format', false, 'a4');

  const id = md5([url, format].join(','));

  const info = (msg: string) => {
    ctx.logger.info(`[id: ${id}][pdf]`, msg);
  };

  info(`url: ${url}`);
  info(`format: ${format}`);

  info(`connect to browser: ${process.env.BROWSER_WS_ENDPOINT} ...`);
  const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });

  info(`create page ...`);
  const page = await browser.newPage();

  info(`goto ${url} ...`);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  // scroll
  info(`scroll to bottom ...`);
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      let timer: NodeJS.Timeout | null = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // too height, resolve
        if (totalHeight > 1e5) {
          clearInterval(timer!);
          timer = null;
          return resolve();
        }

        if (totalHeight >= scrollHeight) {
          clearInterval(timer!);
          timer = null;
          return resolve();
        }
      }, 100);
    });
  });

  // load
  info(`wait for network idle ...`);
  await page.waitForNetworkIdle({
    timeout: 10 * 1000,
  });

  // pdf
  info(`generating pdf ...`);
  const pdf = await page.pdf({
    format: format as 'A4',
  });

  info(`close browser ...`);
  await browser.close();

  info(`send pdf ...`);
  ctx.type = 'application/pdf';
  ctx.body = pdf;
  info(`done`)
}
