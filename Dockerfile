FROM node:10-alpine

WORKDIR /usr/src/cosa

COPY ./package*.json ./

#ENV http_proxy xyz:port
#ENV https_proxy abc:port

RUN npm install

COPY ./ .

EXPOSE 9092
CMD ["node", "build.js"]
CMD [ "npm", "start" ]
