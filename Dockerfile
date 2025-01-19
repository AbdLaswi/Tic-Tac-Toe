# Build Stage
FROM node:22-bullseye AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm ci --only=production

# Production Stage
FROM node:22-bullseye-slim
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app
EXPOSE 3000
CMD ["dumb-init", "npm", "run", "start"]
