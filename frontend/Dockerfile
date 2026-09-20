FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG CLUB_NAME=Клуб
ENV CLUB_NAME=$CLUB_NAME

RUN npm run build

CMD ["sh", "-c", "rm -rf /usr/share/nginx/html/* && cp -a /app/dist/. /usr/share/nginx/html/"]
