import { Context } from '@koex/core';
import * as puppeteer from 'puppeteer';
import md5 from '@zodash/md5';
import * as fs from '@znode/fs';
import doreamon from '@zodash/doreamon';
import * as path from 'path';
import { getConfig } from './utils';

export async function image(ctx: Context) {
  const url: string = getConfig(ctx, 'url', true);
  const encoding: string = getConfig(ctx, 'encoding', false);
  const width = getConfig(ctx, 'width', false);
  const height = getConfig(ctx, 'height', false);
  let fullPage = getConfig(ctx, 'fullPage', false, true);

  if (!!encoding && encoding !== 'base64')  {
    throw new Error(`encoding ${encoding} is not supported (only base64)`);
  }

  const id = md5([url, encoding].join(','));

  const info = (msg: string) => {
    ctx.logger.info(`[id: ${id}][image]`, msg);
  };

  info(`url: ${url}`);
  info(`encoding: ${encoding}`);
  info(`width: ${width}`);
  info(`height: ${height}`);
  info(`fullPage: ${fullPage}`);

  info(`connect to browser: ${process.env.BROWSER_WS_ENDPOINT} ...`);
  const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });

  info(`create page ...`);
  const page = await browser.newPage();

  if (!!width && !!height) {
    info(`page with viewport ${width}x${height} ...`);
    fullPage = false;

    await page.setViewport({
      width: +width,
      height: +height,
    });
  }

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

  // image
  let image;
  let tmpfile;
  if (!!encoding) {
    info(`generating image ...`);
    image = await page.screenshot({
      type: 'png',
      encoding: encoding as any,
    });
  } else {
    tmpfile = path.join(fs.tmpdir(), doreamon.uuid() + '.png');

    info(`generating image to file (${tmpfile})...`);
    await page.screenshot({
      type: 'png',
      encoding: encoding as any,
      path: tmpfile,
      fullPage,
    });
  }


  info(`close browser ...`);
  await browser.close();

  info(`send image ...`);
  if (!encoding) {
    ctx.type = 'image/png';
    ctx.body = fs.createReadStream(tmpfile);
  } else {
    ctx.body = image;
  }

  // @TODO clean
  setTimeout(async () => {
    await fs.unlink(tmpfile);
  }, 30 * 60 * 1000);

  info(`done`)
}
