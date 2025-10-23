const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();
const config = require("../config");

chai.use(chaiHttp);
// Chờ auth service sẵn sàng
async function waitForAuth(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await chai
        //.request(config.authServiceUrl || "http://localhost:3000")
        .request(config.authServiceUrl || "http://auth:3000")
        .post("/login")
        .send({
          username: config.testUser.username,
          password: config.testUser.password,
        });
      return res.body.token;
    } catch (err) {
      console.log(`Auth not ready, retrying... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Auth service is not available after retries");
}

// Chờ product tồn tại trong DB
async function waitForProduct(productId, retries = 20, delay = 500) {
  const Product = require("../models/product");
  for (let i = 0; i < retries; i++) {
    const product = await Product.findById(productId);
    if (product) return product;
    await new Promise(r => setTimeout(r, delay));
  }
  throw new Error(`Product ${productId} not found after ${retries} retries`);
}

describe("Products API", function () {
  let app;
  let authToken;
  let productId;

  this.timeout(60000);

  before(async function () {
    app = new App();
    await app.connectDB();
    authToken = await waitForAuth();
    console.log("Auth token:", authToken);

    // Start server test trên port 4000
    app.start(4000);
  });

  after(async function () {
    await app.disconnectDB();
    await app.stop();
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const product = { name: "Product Test", description: "Description Test", price: 15 };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      productId = res.body._id;
    });
  });

  describe("GET /api/products", () => {
    it("should get all products", async () => {
      const res = await chai
        .request(app.app)
        .get("/api/products")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });

    it("should get product by ID", async () => {
      const res = await chai
        .request(app.app)
        .get(`/api/products/id/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("_id", productId);
    });
  });
});
