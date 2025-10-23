require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
  rabbitMQ: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: process.env.RABBITMQ_PORT || 5672,
    user: process.env.RABBITMQ_USER || 'guest',
    pass: process.env.RABBITMQ_PASS || 'guest',
    queueName: 'orders'
  }
};
