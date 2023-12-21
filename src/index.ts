import App, { Context } from '@koex/core';


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
  })

  app.get('/pdf', pdf);

  app.get('/image', image);

  app.get('/', (ctx) => {
    ctx.body = 'Hello, World!';
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`server start at http://127.0.0.1:${port}.`);
  });
}

main()
  .catch(console.error);
