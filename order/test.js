const amqp = require("amqplib");

(async () => {
  try {
    console.log("🔗 Connecting with extended frameMax...");
    const conn = await amqp.connect({
      protocol: "amqp",
      hostname: "127.0.0.1",
      port: 5672,
      username: "admin123",
      password: "123456",
      frameMax: 0,       // 0 = unlimited
      channelMax: 0,     // default unlimited
      heartbeat: 30,
    });
    console.log("✅ Connected to RabbitMQ!");
    await conn.close();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
})();
