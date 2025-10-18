const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setupOrderConsumer();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  async setupOrderConsumer() {
    try {
      console.log("Connecting to RabbitMQ...");
      const uri = process.env.RABBITMQ_URI || null;
      let connection;
      if (uri) {
        connection = await amqp.connect(uri);
      } else {
        const host = process.env.RABBITMQ_HOST || 'rabbitmq';
        const port = process.env.RABBITMQ_PORT || '5672';
        const user = process.env.RABBITMQ_USER || 'admin123';
        const pass = process.env.RABBITMQ_PASS || '123456';
        connection = await amqp.connect(`amqp://${user}:${pass}@${host}:${port}`);
      }
      console.log("✅ Connected to RabbitMQ");
      
      const channel = await connection.createChannel();
      await channel.assertQueue("orders");

      channel.consume("orders", async (data) => {
        console.log("📦 Processing order from queue");
        const { products, username, orderId } = JSON.parse(data.content);

        const newOrder = new Order({
          products,
          user: username,
          totalPrice: products.reduce((acc, product) => acc + product.price, 0),
        });

        await newOrder.save();
        channel.ack(data);
        console.log("✅ Order saved to DB");

        // Send response back to products queue
        const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
        channel.sendToQueue(
          "products",
          Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
        );
      });
    } catch (err) {
      console.error("❌ Failed to connect to RabbitMQ:", err.message);
      console.log("📝 Order service will continue without message queue");
    }
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
