const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");
    this.retryConnection(3); // Retry 3 times
  }

  async retryConnection(maxRetries, currentRetry = 1) {
    try {
      console.log(`Attempting RabbitMQ connection (${currentRetry}/${maxRetries})...`);
      const connection = await amqp.connect("amqp://localhost:5672");
      
      // Handle connection errors
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err.message);
      });
      
      connection.on('close', () => {
        console.log('RabbitMQ connection closed');
      });

      this.channel = await connection.createChannel();
      await this.channel.assertQueue("products");
      await this.channel.assertQueue("orders");
      console.log("RabbitMQ connected successfully!");
      
    } catch (err) {
      console.error(`Failed to connect to RabbitMQ (attempt ${currentRetry}):`, err.message);
      
      if (currentRetry < maxRetries) {
        const delay = currentRetry * 5000; // Increase delay with each retry
        console.log(`Retrying in ${delay/1000} seconds...`);
        setTimeout(() => {
          this.retryConnection(maxRetries, currentRetry + 1);
        }, delay);
      } else {
        console.error("Max retries reached. Continuing without RabbitMQ...");
        console.log("Order functionality may be limited without RabbitMQ");
      }
    }
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available. Message not sent:", message);
      return false;
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
      console.log(`Message sent to queue '${queue}':`, message);
      return true;
    } catch (err) {
      console.error("Error publishing message:", err.message);
      return false;
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
