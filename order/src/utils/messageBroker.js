const amqp = require("amqplib");
const OrderService = require("../services/orderService");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      console.log("Connecting to RabbitMQ...");
      this.connection = await amqp.connect({
        protocol: "amqp",
        hostname: "localhost",
        port: 5672,
        username: "admin123",
        password: "123456",
        frameMax: 131072,
        channelMax: 0,
        heartbeat: 30,
      });

      this.connection.on("error", (err) => console.error("❌ RabbitMQ error:", err.message));
      this.connection.on("close", () => console.warn("⚠️ RabbitMQ connection closed."));

      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue("orders", { durable: true });

      console.log("✅ RabbitMQ connected successfully!");
      this.consumeOrders();
    } catch (err) {
      console.error("❌ Failed to connect to RabbitMQ:", err.message);
      console.log("📝 Order service will continue without message queue");
    }
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
