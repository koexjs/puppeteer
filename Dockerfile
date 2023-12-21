FROM whatwewant/builder-node:v20-1 as builder

WORKDIR /build

COPY .npmrc .

COPY package.json .

COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn build

FROM whatwewant/node:v20-2

WORKDIR /app

COPY --from=builder /build/lib /app/lib

COPY .npmrc .

COPY package.json .

COPY yarn.lock .

RUN yarn --production

COPY . .

CMD yarn prod
