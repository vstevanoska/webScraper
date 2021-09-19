FROM boldt/base-ubuntu-nvm-node-npm

RUN npm install --save readline puppeteer chart.js-image

RUN apt-get update

RUN apt-get install -y chromium-browser

COPY webScraper.js /