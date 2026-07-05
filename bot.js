// Tự động mở cổng giữ mạng 24/7 trên Render
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bot Minecraft Online!\n');
}).listen(port, () => {
  console.log(`[SYSTEM] Web Server kích hoạt thành công trên cổng ${port}`);
});

const mineflayer = require('mineflayer');
const config = require('./config.json');

let bot;

function createBotInstance() {
  console.log(`[CONNECTING] Đang kết nối tới server ${config.serverHost}:${config.serverPort}...`);
  
  bot = mineflayer.createBot({
    host: config.serverHost,
    port: parseInt(config.serverPort),
    username: config.botUsername,
    auth: 'offline',
    version: config.serverVersion || false,
    viewDistance: 0 // ĐÃ CHỈNH SỬA: Ép tầm nhìn về 0 để tắt hoàn toàn tính năng load chunk của bot
  });

  bot.on('spawn', () => {
    console.log(`\x1b[32m✅ [SUCCESS] Bot ${config.botUsername} đã vào game thành công!\x1b[0m`);
    
    // Nhảy liên tục chống kick AFK
    setInterval(() => {
      if (bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 400);
      }
    }, 3000);
  });

  // Tự động kết nối lại nếu bị kick hoặc server khởi động lại
  bot.on('end', (reason) => {
    console.log(`[DISCONNECTED] Bot bị ngắt kết nối. Lý do: ${reason}. Sẽ thử lại sau 15 giây...`);
    setTimeout(createBotInstance, 15000);
  });

  bot.on('error', (err) => {
    console.error(`[ERROR] Gặp lỗi mạng: ${err.message}`);
  });
}

// Chạy bot
createBotInstance();
