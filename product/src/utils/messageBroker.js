const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.reconnectDelay = 1000; // ms
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
      console.log("⚠️ RabbitMQ not connected — skipping message send.");
      return false;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      await this.channel.sendToQueue(queue, buffer);
      console.log(`📨 Message sent to queue '${queue}':`, message);
      return true;
    } catch (err) {
      console.error("❌ Error publishing message:", err.message);
      return false;
    }
  }

  // Hàm consumeMessage — cho phép Product service nhận message (ví dụ phản hồi hoặc update tồn kho)
  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.log("📝 RabbitMQ channel not available - skipping consumer setup");
      return;
    }

    try {
      await this.channel.consume(queue, (msg) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Received message from '${queue}':`, content);
          callback(content);
          this.channel.ack(msg);
        } catch (err) {
          console.error("❌ Error processing message:", err.message);
          this.channel.reject(msg, false);
        }
      });
      console.log(`👂 Listening to queue '${queue}'`);
    } catch (err) {
      console.error("❌ Error setting up consumer:", err.message);
    }
  }
}

module.exports = new MessageBroker();
