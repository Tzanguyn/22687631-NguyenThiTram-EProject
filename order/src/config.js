require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
<<<<<<< HEAD
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://admin123:123456@rabbitmq:5672',
=======
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://127.0.0.1:5672',
>>>>>>> 367dd25cfa68b89671c9be865bf312c8eb4140b8
    rabbitMQQueue: process.env.RABBITMQ_QUEUE || 'orders',
    port: process.env.PORT || 3002
};
  