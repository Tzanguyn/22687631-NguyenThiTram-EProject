const chai = require("chai");
const chaiHttp = require("chai-http");
require("dotenv").config();
const config = require("../config/index"); // dùng config chung
const { expect } = chai;

chai.use(chaiHttp);

describe("User Authentication", () => {
  const AUTH_URL = "http://auth:3000"; 
  //const AUTH_URL = "http://localhost:3000"; 
  // container Auth chạy trên Docker

  // lấy dữ liệu test từ config hoặc .env
  const TEST_USER = process.env.TEST_USER || config.testUser?.username || "testuser";
  const TEST_PASS = process.env.TEST_PASS || config.testUser?.password || "password";

  // requester trực tiếp tới container Auth
  let requester = chai.request(AUTH_URL).keepOpen();

  after(() => {
    requester.close();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await requester
        .post("/register")
        .send({ username: TEST_USER, password: TEST_PASS });

      // Nếu user đã tồn tại thì chỉ cần chấp nhận kết quả lỗi 400
      if (res.status === 400) {
        expect(res.body).to.have.property("message", "Username already taken");
      } else {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("username", TEST_USER);
      }
    });
  });

  describe("POST /login", () => {
    it("should return a JWT token for a valid user", async () => {
      const res = await requester
        .post("/login")
        .send({ username: TEST_USER, password: TEST_PASS });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("should return an error for an invalid user", async () => {
      const res = await requester
        .post("/login")
        .send({ username: "invaliduser", password: TEST_PASS });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });

    it("should return an error for an incorrect password", async () => {
      const res = await requester
        .post("/login")
        .send({ username: TEST_USER, password: "wrongpassword" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });
  });
});
