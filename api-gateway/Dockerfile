FROM node:20-bullseye-slim

WORKDIR /usr/src/app

RUN apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
