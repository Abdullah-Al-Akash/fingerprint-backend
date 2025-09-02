const net = require("net");

const host = "192.168.0.201";
const port = 4370;

const socket = new net.Socket();

socket.setTimeout(3000);

socket.on("connect", () => {
  console.log(`✅ Port ${port} is open on ${host}`);
  socket.destroy();
});

socket.on("timeout", () => {
  console.log(`❌ Connection timed out to ${host}:${port}`);
  socket.destroy();
});

socket.on("error", (err) => {
  console.log(`❌ Error: ${err.message}`);
  socket.destroy();
});

socket.connect(port, host);