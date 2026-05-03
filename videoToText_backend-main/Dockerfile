FROM node:20

WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./ ./

ENV GOOGLE_APPLICATION_CREDENTIALS="/app/credentials/VidToText.json"

CMD ["npm","run","watch"]