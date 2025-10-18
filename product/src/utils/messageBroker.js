const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.reconnectDelay = 1000; // ms
  }
  async connect() {
    // connect with retry and exponential backoff
    const maxAttempts = 10;
    let attempt = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`Connecting to RabbitMQ (Product service)... attempt ${attempt}`);
        const uri = process.env.RABBITMQ_URI || null;
        if (uri) {
          this.connection = await amqp.connect(uri);
        } else {
          const hostname = process.env.RABBITMQ_HOST || 'rabbitmq';
          const port = process.env.RABBITMQ_PORT ? Number(process.env.RABBITMQ_PORT) : 5672;
          const username = process.env.RABBITMQ_USER || 'admin123';
          const password = process.env.RABBITMQ_PASS || '123456';

          this.connection = await amqp.connect({
            protocol: 'amqp',
            hostname,
            port,
            username,
            password,
            frameMax: 131072,
            heartbeat: 30,
          });
        }

        this.connection.on("error", (err) => console.error("❌ RabbitMQ error:", err.message));
        this.connection.on("close", async () => {
          console.warn("⚠️ RabbitMQ connection closed. Attempting to reconnect...");
          this.channel = null;
          // attempt reconnect loop
          await this.connect();
        });

        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue("orders", { durable: true });
        await this.channel.assertQueue("products", { durable: true });

        console.log("✅ Product service connected to RabbitMQ");
        return;
      } catch (err) {
        console.error(`❌ Failed to connect to RabbitMQ (Product) on attempt ${attempt}:`, err.message);
        this.channel = null;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, attempt - 1), 30000);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
    console.error(`❌ Could not connect to RabbitMQ after ${maxAttempts} attempts`);
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
