const chai = require('chai');
const chaiHttp = require('chai-http');
require('dotenv').config();
const expect = chai.expect;
chai.use(chaiHttp);

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3000';
const PRODUCT_URL = process.env.PRODUCT_URL || 'http://localhost:3001';
const ORDER_URL = process.env.ORDER_URL || 'http://localhost:3002';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3003';

describe('E2E integration', function() {
  this.timeout(120000);

  it('runs auth -> product -> order -> gateway flows', async function() {
    const testUser = { username: 'e2euser', password: 'password' };

    // register
    await chai.request(AUTH_URL).post('/register').send(testUser);

    // login
    const loginRes = await chai.request(AUTH_URL).post('/login').send(testUser);
    expect(loginRes).to.have.status(200);
    const token = loginRes.body.token;

    // create product
    const productRes = await chai.request(PRODUCT_URL)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E Product', description: 'e2e', price: 9.99 });
    expect(productRes).to.have.status(201);
    const productId = productRes.body._id;

    // create order via product buy
    const buyRes = await chai.request(PRODUCT_URL)
      .post('/api/products/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId });
    expect(buyRes).to.have.status(200);

    // gateway health
    const gw = await chai.request(GATEWAY_URL).get('/');
    expect(gw.status).to.be.oneOf([200, 404]);
  });
});
