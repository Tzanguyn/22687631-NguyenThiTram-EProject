const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
const productsRouter = require("./routes/productRoutes");
require("dotenv").config();

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
    // setupMessageBroker is async; don't await in constructor. Call it from start().
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

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.use("/api/products", productsRouter);
  }

  setupMessageBroker() {
    // connect and register consumers
    return MessageBroker.connect();
  }

  start() {
    // Ensure message broker is connected and consumers are registered before starting
    (async () => {
      try {
        await this.setupMessageBroker();

        // Register consumer for product messages and pass controller handler
        const ProductController = require("./controllers/productController");
        const productController = new ProductController();
        MessageBroker.consumeMessage("products", productController.handleProductMessage);

        this.server = this.app.listen(3001, () =>
          console.log("Server started on port 3001")
        );
      } catch (err) {
        console.error('Failed to start server due to MessageBroker error:', err.message);
      }
    })();
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
