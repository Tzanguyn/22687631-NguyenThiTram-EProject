require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://admin123:123456@rabbitmq:5672',
    rabbitMQQueue: process.env.RABBITMQ_QUEUE || 'orders',
    port: process.env.PORT || 3002
};
  