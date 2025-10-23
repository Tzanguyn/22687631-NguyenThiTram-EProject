const amqp = require("amqplib"); // Thư viện AMQP để làm việc với RabbitMQ
const config = require("../config");
const OrderService = require("../services/orderService"); 

class MessageBroker {
  static async connect() {
    try {
      const connection = await amqp.connect(config.rabbitMQUrl); // không sử dụng tại file app đã tích hợp đầy đủ consume  
      const channel = await connection.createChannel();

      // Declare the order queue
      await channel.assertQueue(config.rabbitMQQueue, { durable: true });

      // Consume messages from the order queue on buy
      channel.consume(config.rabbitMQQueue, async (message) => {
        try {
          const order = JSON.parse(message.content.toString());
          const orderService = new OrderService();
          await orderService.createOrder(order);
          channel.ack(message);
        } catch (error) {
          console.error(error);
          channel.reject(message, false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MessageBroker;
