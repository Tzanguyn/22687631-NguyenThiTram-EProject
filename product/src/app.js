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
    this.setupMessageBroker();
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
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
    MessageBroker.connect();
  }

  start(port = config.port) {
    this.server = this.app.listen(port, () =>
      console.log(`Server started on port ${port}`)
    );
  }

  async stop() {
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.log('Error disconnecting mongoose:', e.message || e);
    }
    if (this.server && this.server.close) {
      this.server.close();
      console.log("Server stopped");
    } else {
      console.log("Server was not running");
    }
  }
  
}

module.exports = App;
