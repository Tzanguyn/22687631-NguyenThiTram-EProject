# Chọn Node 20
FROM node:20

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json để cài dependencies
COPY package*.json ./

# Cài tất cả dependencies và devDependencies
RUN npm install

# Cài amqplib phiên bản mới nhất
RUN npm install amqplib@latest

# Copy toàn bộ code vào container
COPY . .

# Mở port của service auth
EXPOSE 3000

# Lệnh chạy app
CMD ["node", "index.js"]
