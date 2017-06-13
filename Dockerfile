FROM node:latest

RUN mkdir warcrafthub-api
WORKDIR warcrafthub-api

RUN mkdir logs

COPY package.json package.json
RUN npm install
RUN npm install -g pm2


COPY app warcrafthub-api
COPY scripts warcrafthub-api

COPY server.js warcrafthub-api/server.js
COPY processes.json warcrafthub-api/processes.json


EXPOSE 3000

CMD pm2 start -x warcrafthub-api/processes.json --no-daemon --watch

