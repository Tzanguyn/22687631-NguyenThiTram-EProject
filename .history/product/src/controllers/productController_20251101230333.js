const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');
const ProductsService = require("../services/productsService");

/**
 * Class to hold the API implementation for the product services
 */
class ProductController {

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    this.ordersMap = new Map();
    this.getProductById = this.getProductById.bind(this);
    this.productsService = new ProductsService();

    // Register a single consumer for "products" results so each request
    // doesn't create a new consumer. The consumer will update ordersMap
    // when an order fulfillment message arrives.
    try {
      messageBroker.consumeMessage("products", (data) => {
        try {
          const orderData = JSON.parse(JSON.stringify(data));
          const { orderId } = orderData;
          const order = this.ordersMap.get(orderId);
          if (order) {
            this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
            console.log('Updated order from products consumer:', orderId);
          }
        } catch (err) {
          console.error('Error handling products message:', err);
        }
      });
    } catch (err) {
      // If the broker isn't available at construction time, log and continue.
      console.warn('Could not register products consumer at startup:', err && err.message);
    }
  }

  async createProduct(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const product = new Product(req.body);

      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      await product.save({ timeout: 30000 });

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { ids } = req.body;
      const products = await Product.find({ _id: { $in: ids } });

      const orderId = uuid.v4(); // Generate a unique order ID
      this.ordersMap.set(orderId, {
        status: "pending",
        products,
        username: req.user && req.user.username
      });

      await messageBroker.publishMessage("orders", {
        products,
        username: req.user && req.user.username,
        orderId,
      });

      // Poll for completion with timeout to avoid long blocking requests.
      const pollInterval = 200; // ms
      const timeoutMs = 30000; // 30s
      const start = Date.now();

      let order = this.ordersMap.get(orderId);
      while ((Date.now() - start) < timeoutMs) {
        if (order && order.status === 'completed') {
          return res.status(201).json(order);
        }
        // wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        order = this.ordersMap.get(orderId);
      }

      // If not completed within timeout, return 202 with orderId so client can poll status
      return res.status(202).json({ message: 'Order pending', orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  }

  async getProducts(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const products = await Product.find({});

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getProductById(req, res, next) {
    const product = await this.productsService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
  }
}

module.exports = ProductController;
