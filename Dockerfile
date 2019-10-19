FROM node

RUN mkdir -p /app
WORKDIR /app

RUN npm i -g typescript

COPY package.json /app
RUN npm i

COPY . /app
RUN tsc
RUN rm -rf ./src

EXPOSE 3000
CMD ["nodemon", "./dist/server.js"]