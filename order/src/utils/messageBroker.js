const amqp = require("amqplib");
const OrderService = require("../services/orderService");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.reconnectDelay = 1000;
  }
  async connect() {
    const maxAttempts = 10;
    let attempt = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`Connecting to RabbitMQ... attempt ${attempt}`);
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
            channelMax: 0,
            heartbeat: 30,
          });
        }

        this.connection.on("error", (err) => console.error("❌ RabbitMQ error:", err.message));
        this.connection.on("close", async () => {
          console.warn("⚠️ RabbitMQ connection closed. Attempting to reconnect...");
          this.channel = null;
          await this.connect();
        });

        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue("orders", { durable: true });

        console.log("✅ RabbitMQ connected successfully!");
        this.consumeOrders();
        return;
      } catch (err) {
        console.error(`❌ Failed to connect to RabbitMQ on attempt ${attempt}:`, err.message);
        console.log("📝 Order service will continue without message queue for now");
        const delay = Math.min(this.reconnectDelay * Math.pow(2, attempt - 1), 30000);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    console.error(`❌ Could not connect to RabbitMQ after ${maxAttempts} attempts`);
  }

  async consumeOrders() {
    if (!this.channel) return console.log("⚠️ No channel - skipping consumer");

    await this.channel.consume("orders", async (msg) => {
      if (!msg) return;
      try {
        const orderData = JSON.parse(msg.content.toString());
        console.log("📥 Received order:", orderData);

        const orderService = new OrderService();
        await orderService.createOrder(orderData);

        this.channel.ack(msg);
        console.log("✅ Order processed successfully");
      } catch (err) {
        console.error("❌ Error processing order:", err.message);
        this.channel.reject(msg, false);
      }
    });

    console.log("👂 Listening to queue 'orders'");
  }
}

module.exports = new MessageBroker();
