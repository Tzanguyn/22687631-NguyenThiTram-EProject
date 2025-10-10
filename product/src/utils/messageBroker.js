const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      console.log("Connecting to RabbitMQ (Product service)...");
      this.connection = await amqp.connect({
        protocol: "amqp",
        hostname: "127.0.0.1",
        port: 5672,
        username: "admin123",
        password: "123456",
        frameMax: 131072,
        heartbeat: 30,
      });

      this.connection.on("error", (err) => console.error("❌ RabbitMQ error:", err.message));
      this.connection.on("close", () => console.warn("⚠️ RabbitMQ connection closed."));

      this.channel = await this.connection.createChannel();

      // Queue dùng để gửi sang Order service
      await this.channel.assertQueue("orders", { durable: true });

      // Queue riêng cho Product service (để test hoặc nhận phản hồi)
      await this.channel.assertQueue("products", { durable: true });

      console.log("✅ Product service connected to RabbitMQ");
    } catch (err) {
      console.error("❌ Failed to connect to RabbitMQ (Product):", err.message);
      this.channel = null;
    }
  }

  // Hàm publish gửi message sang Order service
  async publishOrder(order) {
    if (!this.channel) {
      console.log("⚠️ RabbitMQ not connected — skipping message send.");
      return;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(order));
      await this.channel.sendToQueue("orders", buffer);
      console.log("📨 Order message sent:", order);
    } catch (err) {
      console.error("❌ Error publishing message:", err.message);
    }
  }

  // Generic publish (keeps backward compatibility with controllers that call publishMessage)
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
