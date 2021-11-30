FROM node:12.18.3-alpine
WORKDIR /home/node
ADD package.json .
ADD package-lock.json .
RUN npm install
ADD . .
RUN npm run build
CMD npm run ${NODE_ENV:-dev}
