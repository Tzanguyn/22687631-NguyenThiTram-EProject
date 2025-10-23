# E-commerce Microservices Project

A complete microservices-based e-commerce application built with Node.js, Express, MongoDB, and RabbitMQ.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Message Queue:** RabbitMQ
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **API Testing:** Postman

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- [RabbitMQ](https://www.rabbitmq.com/download.html) (v3.8 or higher)
- [Postman](https://www.postman.com/downloads/) (for API testing)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd EProject-Phase-1
```

### 2. Install dependencies for all services
```bash
# Root dependencies
npm install

# Auth service
cd auth && npm install && cd ..

# Product service
cd product && npm install && cd ..

# Order service
cd order && npm install && cd ..

# API Gateway
cd api-gateway && npm install && cd ..
```
### 3. Start external services
```bash
# Start MongoDB
mongod

# Start RabbitMQ
rabbitmq-server
```


### Run RabbitMQ with Docker

The repository contains a `docker-compose.yml` that starts a RabbitMQ container with the management UI and a default user (admin123 / 123456).

Open a terminal at the project root and run:

```powershell
docker compose up -d
```

This exposes:
- AMQP: localhost:5672
- Management UI: http://localhost:15672 (login: admin123 / 123456)

Environment variables
- The services will read `RABBITMQ_URI` (full amqp URI) if present. If not set, they will default to connecting to a service named `rabbitmq` (this works when using the included docker-compose).

Examples:

```powershell
# Use default docker-compose RabbitMQ (no extra env vars required)
docker compose up -d

# Or run with a custom RabbitMQ URL for local dev
#$Env:RABBITMQ_URI = 'amqp://admin123:123456@127.0.0.1:5672'
node product/index.js
```

### 5. Start all microservices

## 📚 API Documentation

### Base URL
All requests should be made to: `http://localhost:3003`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser1",
  "password": "123456"
}
```
![alt text](public/image/image.png)

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser1",
  "password": "123456"
}
```
![alt text](public/image/image-1.png)
# In MongoDB
![alt text](public/image/image-23.png)
#### Access Protected Route
```http
GET /auth/dashboard
Authorization: Bearer <JWT_TOKEN>
```
![alt text](public/image/image-2.png)

### Product Endpoints

#### Create Product
```http
POST /products/api/products
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max",
  "price":1299.99,
  "description": "Latest iPhone with advanced camera system"
}
```
![alt text](public/image/image-3.png)
# In MongoDB
![alt text](public/image/image-24.png)
#### Get All Products
```http
GET /products/api/products
Authorization: Bearer <JWT_TOKEN>
```
![alt text](public/image/image-4.png)

### Order Endpoints

#### Create Order (Buy Products)
```http
POST /products/api/products/buy
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "ids": ["<PRODUCT_ID_1>", "<PRODUCT_ID_2>"]
}
```
![alt text](public/image/image-25.png)
<<<<<<< HEAD

![alt text](public/image/image-26.png)

![alt text](public/image/image-27.png)

![alt text](public/image/image-28.png)
=======

![alt text](public/image/image-26.png)

![alt text](public/image/image-27.png)

![alt text](public/image/image-28.png)

<img width="1920" height="1200" alt="Screenshot 2025-10-10 124917" src="https://github.com/user-attachments/assets/b957e99d-cd36-4879-a809-44f39fb5a46d" />

>>>>>>> 367dd25cfa68b89671c9be865bf312c8eb4140b8
## 🧪 Testing

### Test Cases Overview

This section covers comprehensive testing scenarios including both **VALID** ✅ and **INVALID** ❌ test cases.

### Authentication Test Cases

#### ✅ Valid Test Cases

**1. Register New User (Success)**
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser1",
  "password": "123456"
}
```
**Expected:** `201 Created` - User registered successfully

**2. Login with Correct Credentials**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser1",
  "password": "123456"
}
```
**Expected:** `200 OK` + JWT token

**3. Access Protected Route with Valid Token**
```http
GET /auth/dashboard
Authorization: Bearer <VALID_JWT_TOKEN>
```
**Expected:** `200 OK` - Dashboard data

#### ❌ Invalid Test Cases

**1. Register with Missing Username**
```http
POST /auth/register
Content-Type: application/json

{
  "password": "123456"
}
```
**Expected:** `400 Bad Request` - Username required
![alt text](public/image/image-7.png)
**2. Register with Missing Password**
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser2"
}
```
**Expected:** `400 Bad Request` - Password required
![alt text](public/image/image-8.png)
**3. Register with Existing Username**
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser1",
  "password": "abcdef"
}
```
**Expected:** `400 Bad Request` - User already exists
![alt text](public/image/image-9.png)
**4. Login with Wrong Username**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "saiusername",
  "password": "123456"
}
```
**Expected:** `401 Unauthorized` - Invalid credentials
![alt text](public/image/image-10.png)
**5. Login with Wrong Password**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser1",
  "password": "saipassword"
}
```
**Expected:** `401 Unauthorized` - Invalid credentials
![alt text](public/image/image-11.png)
**6. Access Protected Route without Token**
```http
GET /auth/dashboard
```
**Expected:** `401 Unauthorized` - Token required
![alt text](public/image/image-12.png)
**7. Access Protected Route with Invalid Token**
```http
GET /auth/dashboard
Authorization: Bearer invalid_token_here
```
**Expected:** `403 Forbidden` - Invalid token
![alt text](public/image/image-13.png)
### Product Test Cases

#### ✅ Valid Test Cases

**1. Create Product (Success)**
```http
POST /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "price": 999.99,
  "description": "Latest iPhone model"
}
```
**Expected:** `201 Created` - Product created

**2. Get All Products**
```http
GET /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
```
**Expected:** `200 OK` - Array of products

**3. Create Product with Minimum Fields**
```http
POST /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "name": "Samsung Galaxy",
  "price": 599.99
}
```
**Expected:** `201 Created` - Product created

#### ❌ Invalid Test Cases

**1. Create Product without Authentication**
```http
POST /products/api/products
Content-Type: application/json

{
  "name": "MacBook Pro",
  "price": 2499.99
}
```
**Expected:** `401 Unauthorized` - Token required
![alt text](public/image/image-14.png)
**2. Create Product with Missing Name**
```http
POST /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "price": 999.99,
  "description": "Product without name"
}
```
**Expected:** `400 Bad Request` - Name required
![alt text](public/image/image-15.png)
**3. Create Product with Missing Price**
```http
POST /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "name": "iPad Air",
  "description": "Tablel without price"
}
```
**Expected:** `400 Bad Request` - Price required
![alt text](public/image/image-16.png)

**5. Create Product with Invalid Price Type**
```http
POST /products/api/products
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "name": "Invalid Price Product",
  "price": "not_a_number",
  "description": "Price should be number"
}
```
**Expected:** `400 Bad Request` - Price must be a number
![alt text](public/image/image-17.png)
**6. Get Products without Authentication**
```http
GET /products/api/products
```
**Expected:** `401 Unauthorized` - Token required
![alt text](public/image/image-18.png)
### Order Test Cases

#### ✅ Valid Test Cases

**1. Create Order with Valid Product IDs**
```http
POST /products/api/products/buy
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "ids": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"]
}
```

**Expected:** `200 OK` - Order created successfully

**2. Create Order with Single Product**
```http
POST /products/api/products/buy
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "ids": ["64f1a2b3c4d5e6f7g8h9i0j1"]
}
```
**Expected:** `200 OK` - Order created successfully

#### ❌ Invalid Test Cases

**1. Create Order without Authentication**
```http
POST /products/api/products/buy
Content-Type: application/json

{
  "ids": ["64f1a2b3c4d5e6f7g8h9i0j1"]
}
```
**Expected:** `401 Unauthorized` - Token required
![alt text](public/image/image-19.png)
**2. Create Order with Empty IDs Array**
```http
POST /products/api/products/buy
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "ids": []
}
```
**Expected:** `400 Bad Request` - Product IDs required
![alt text](public/image/image-29.png)

**4. Create Order with Invalid Product ID Format**
```http
POST /products/api/products/buy
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "ids": ["invalid_id_format"]
}
```
**Expected:** `400 Bad Request` - Invalid product ID format
![alt text](public/image/image-30.png)
**5. Create Order with Non-existent Product ID**
```http
POST /products/api/products/buy
Authorization: Bearer <VALID_JWT_TOKEN>
Content-Type: application/json

{
  "ids": ["64f1a2b3c4d5e6f7g8h9i999"]
}
```
**Expected:** `400 Bad Request` - Product not found
![alt text](public/image/image-31.png)
### Using Postman

1. Import the provided Postman collection
2. Set up environment variables:
   - `base_url`: `http://localhost:3003`
   - `auth_token`: (auto-set after login)
3. **Test Execution Order:**
   - **Phase 1:** Authentication Tests (Valid + Invalid)
   - **Phase 2:** Product Tests (Valid + Invalid) 
   - **Phase 3:** Order Tests (Valid + Invalid)

### Running Unit Tests
```bash
# Run all tests
npm test

# Run tests for specific service
cd auth && npm test
cd product && npm test
```

## 🔄 Message Flow

1. **User Registration/Login** → Auth Service generates JWT
2. **Product Creation** → Product Service stores in MongoDB
3. **Order Placement** → Product Service sends message to RabbitMQ
4. **Order Processing** → Order Service consumes message and saves order
5. **Order Completion** → Order Service sends confirmation back

## 🐳 Docker Support (Optional)

### Using Docker Compose
```bash
docker-compose up -d
```

This will start:
- MongoDB container
- RabbitMQ container
- All microservices

## 📁 Project Structure

```
EProject-Phase-1/
├── public/
|    └── image/
├── api-gateway/          # API Gateway service
│   ├── index.js
│   └── package.json
├── auth/                 # Authentication service
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── middlewares/
│   ├── index.js
│   └── package.json
├── product/              # Product management service
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── index.js
│   └── package.json
├── order/                # Order processing service
│   ├── src/
│   │   ├── models/
│   │   └── utils/
│   ├── index.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   netstat -ano | findstr :3000
   # Kill process
   taskkill /F /PID <PID>
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check connection string in .env files

3. **RabbitMQ connection failed**
   - Ensure RabbitMQ server is running
   - Check if port 5672 is accessible

4. **JWT token issues**
   - Ensure JWT_SECRET is set in all .env files
   - Check token expiration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Node.js community
- Express.js team
- MongoDB team
- RabbitMQ team

## CI / CD

This repository includes basic GitHub Actions workflows for Continuous Integration (tests) and Continuous Delivery (build/push images).

Workflows added:
- `.github/workflows/ci.yml` — runs unit/integration tests for `auth` and `product` services using local MongoDB and RabbitMQ services provided by the Actions runner.
- `.github/workflows/cd.yml` — builds Docker images for the services and pushes to the registry configured by secrets (Docker Hub or other registry).

Required repository secrets for CD (Settings → Secrets):
- `REGISTRY_USERNAME` — your registry username (Docker Hub or GitHub Packages username)
- `REGISTRY_PASSWORD` — registry password or token
- `REGISTRY_HOST` — optional, defaults to `docker.io`

Optional secrets for SSH deploy (CD):
- `DEPLOY_HOST` — server IP or hostname
- `DEPLOY_USER` — SSH user
- `DEPLOY_KEY` — SSH private key (PEM) for the user

How CI works
- The CI workflow starts MongoDB and RabbitMQ services in the job environment, installs dependencies, starts the `auth` service so `product` tests can authenticate, and runs the mocha tests found in `auth/src/test` and `product/src/test`.

How CD works
- The CD workflow triggers on pushes with a tag that starts with `v` (for example `v1.0.0`) or manually. It builds images for the services and pushes them to the configured registry. After push, if SSH deploy secrets are set the workflow will run a `docker compose pull && docker compose up -d` on the target server.

Local testing of CI steps
1. Start services locally using docker compose:

```powershell
docker compose up -d
```

2. Run the root test command (this executes all local tests):

```powershell
npm test
```

Notes & next steps
- The tests depend on services starting on localhost ports used by the repo (Mongo:27017, RabbitMQ:5672) — CI starts these containers for you. If you change ports, update workflows accordingly.
- Consider publishing images to GitHub Container Registry by setting `REGISTRY_HOST=ghcr.io` and using a GitHub PAT with appropriate scopes.
- For production deploy, replace the simple SSH step with a more secure process (Ansible, Terraform, or a GitOps approach).