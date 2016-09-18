FROM node:6.5.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install nodemon -g

WORKDIR /usr/src/app
ADD package.json /usr/src/app/package.json
RUN npm install

ADD nodemon.json /usr/src/app/nodemon.json

EXPOSE 3222

CMD npm start
