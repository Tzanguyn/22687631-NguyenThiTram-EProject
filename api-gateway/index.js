const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();

// Add a robust error handler so gateway doesn't crash when a target is down
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err && err.message ? err.message : err);
  try {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ message: 'Bad gateway: upstream service unavailable' }));
  } catch (e) {
    console.error('Failed to send proxy error response', e);
  }
});

// Route requests to the auth service (use Docker Compose service name)
app.use('/auth', (req, res) => {
  proxy.web(req, res, { target: 'http://auth:3000' });
});

// Route requests to the product service
app.use('/products', (req, res) => {
  proxy.web(req, res, { target: 'http://product:3001' });
});

// Route requests to the order service
app.use('/orders', (req, res) => {
  proxy.web(req, res, { target: 'http://order:3002' });
});

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
