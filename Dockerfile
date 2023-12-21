FROM whatwewant/builder-node:v20-1 as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /build

COPY .npmrc .

COPY package.json .

COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn build

FROM whatwewant/node:v20-2

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY .npmrc .

COPY package.json .

COPY yarn.lock .

RUN yarn --production

COPY . .

COPY --from=builder /build/lib /app/lib

CMD yarn prod
