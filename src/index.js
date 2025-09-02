require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const usersRouter = require("./routes/users");
const { startZK } = require("./services/zk");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

// Health check
app.get("/health", (_req, res) =>
  res.json({ ok: true, mongo: true, zk: global.zkConnected ?? false })
);

// Users routes
app.use("/users", usersRouter);

//==============================================================
// Start server
const PORT = process.env.PORT || 5000;

(async function bootstrap() {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2️⃣ Configure ZKTeco
    const zkConfig = {
      ip: process.env.ZK_IP || "192.168.0.201",
      port: parseInt(process.env.ZK_PORT, 10) || 4370,
      timeout: parseInt(process.env.ZK_TIMEOUT, 10) || 20000,
      idle: parseInt(process.env.ZK_IDLE_TIMEOUT, 10) || 10000,
    };

    console.log("⚙️ Starting ZKTeco service with config:", zkConfig);

    // Keep reconnecting until success
    const tryConnectZK = async () => {
      try {
        await startZK(zkConfig);
        global.zkConnected = true;
        console.log("✅ Connected to ZKTeco device");
      } catch (err) {
        global.zkConnected = false;

        // Optional: clean error message only
        // console.error(`❌ Failed to connect to ZKTeco at ${zkConfig.ip}:${zkConfig.port}. Retrying in 5s...`);

        // Log detailed error only in DEBUG mode
        if (process.env.DEBUG === "true") {
          console.error("Debug error:", err);
        }

        setTimeout(tryConnectZK, 5000);
      }
    };

    tryConnectZK();

    // 3️⃣ Start API server
    app.listen(PORT, () => {
      console.log(`🚀 API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Fatal error during bootstrap:", err);
    process.exit(1);
  }
})();
