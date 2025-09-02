const ZKLib = require("node-zklib");
const { User } = require("../models/User");
require("dotenv").config(); // load .env

async function startZK(config = {}) {
  const ip = config.ip || process.env.ZK_IP;
  const port = Number(config.port || process.env.ZK_PORT || 4370);
  const timeout = Number(config.timeout || process.env.ZK_TIMEOUT || 5000);
  const idle = Number(config.idle || process.env.ZK_IDLE_TIMEOUT || 10000);
  const commKey = Number(config.commKey || process.env.ZK_COMMKEY || 0);
  const deviceId = Number(config.deviceId || process.env.ZK_DEVICE_ID || 1);

  console.log("📡 Trying to connect with settings:", {
    ip,
    port,
    timeout,
    idle,
    commKey,
    deviceId,
  });

  const zk = new ZKLib(ip, port, timeout, idle, commKey, deviceId);

  try {
    
    const data = await zk.createSocket();
    console.log("Data From ZK",data);
    const users = await zk.getUsers()
    console.log(users)
    console.log(`✅ Connected to ZKTeco @ ${ip}:${port}`);

    // Print device info
    try {
      const info = await zk.getInfo();
      console.log("ℹ️ Device info:", info);
    } catch (infoErr) {
      console.warn("⚠️ Failed to get device info:", infoErr.message || infoErr);
    }

    // Subscribe to real-time logs
    try {
      zk.getRealTimeLogs(async (data) => {
        try {
          const fpId = Number(data?.userId);
          if (!Number.isFinite(fpId)) return;

          const user = await User.findOne({ fingerprintId: fpId });
          if (user) {
            console.log(
              `👤 ${user.name} (${user.userId}) | FP:${fpId} | ${new Date().toLocaleString()}`
            );
          } else {
            console.log(`❓ Unknown fingerprintId: ${fpId}`);
          }
        } catch (err) {
          console.error("⚠️ Error handling real-time log:", err);
        }
      });
    } catch (logErr) {
      console.error("⚠️ Failed to subscribe to real-time logs:", logErr);
    }

    // Disconnection listener
    zk.on("disconnect", () => {
      console.error("⚠️ ZKTeco disconnected.");
    });

    return zk;
  } catch (err) {
    console.error("❌ Failed to connect to ZKTeco:", err?.message || err);
    return null;
  }
}

module.exports = { startZK };
