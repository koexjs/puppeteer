import App, { Context } from '@koex/core';
import body from '@koex/body';

import { pdf } from './pdf';
import { image } from './image';

async function main() {
  if (!process.env.BROWSER_WS_ENDPOINT) {
    throw new Error('env BROWSER_WS_ENDPOINT is required');
  }

  console.log('[env] BROWSER_WS_ENDPOINT:', process.env.BROWSER_WS_ENDPOINT);

  const port = +process.env.PORT! || 8080;

  const app = new App();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.logger.error('[onerror]', err);
      ctx.body = {
        code: 500,
        message: err.message || 'Internal Server Error',
      };
    }
  });

  app.use(body());

  app.get('/pdf', pdf);
  app.post('/pdf', pdf);

  app.get('/image', image);
  app.post('/image', image);

  app.get('/', (ctx) => {
    ctx.body = {
      title: `Puppeteer as a Service`,
      features: [
        {
          name: 'pdf',
          description: 'Generate PDF from URL',
          usage: '/pdf?url=<The Site URL>[&format=a4]',
          examples: [
            '/pdf?url=https://www.baidu.com',
            '/pdf?url=https://www.baidu.com&format=a4',
            '/pdf?url=https://www.baidu.com&format=letter',
          ],
        },
        {
          name: 'image',
          description: 'Generate Image from URL',
          usage: '/image?url=<The Site URL>[&encoding=base64][&width=1024][&height=768][&fullPage=true]',
          examples: [
            '/image?url=https://www.baidu.com',
            '/image?url=https://www.baidu.com&encoding=base64',
            '/image?url=https://www.baidu.com&width=1024&height=768',
            '/image?url=https://www.baidu.com&fullPage=false',
          ],
        },
      ],
    };
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`server start at http://127.0.0.1:${port}.`);
  });
}

main()
  .catch(console.error);
