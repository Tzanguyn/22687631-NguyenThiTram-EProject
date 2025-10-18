FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Update system packages (apt) and clean up lists to keep image small
RUN apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
