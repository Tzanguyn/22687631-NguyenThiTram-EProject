# Chọn Node 20
FROM node:20

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json để cài dependencies
COPY package*.json ./

# Cài tất cả dependencies
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Mở port của service gateway
EXPOSE 3003

# Lệnh chạy app
CMD ["node", "index.js"]
