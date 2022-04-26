FROM node:17.7.2 as builder

RUN npm install -g typescript

WORKDIR /app
COPY . ./

RUN npm install --production && \
    tsc

FROM node:17.7.2 as prod
WORKDIR /app

COPY --from=builder /app/out/ /app/out/
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/node_modules/ /app/node_modules/

ENTRYPOINT [ "npm", "run", "start", "--ignore-scripts" ]