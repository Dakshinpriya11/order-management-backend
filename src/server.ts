import http from "http";
import cron from "node-cron";
import app from "./app";
import { connectDB, sequelize } from "./config/db";
import { env } from "./config/env";
import "./database/models/user.model";
import { errorHandler } from "./middleware/error.middleware";
import { orderStatusCron } from "./modules/orders/order.cron";
import { initSocket } from "./socket";

const start = async () => {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Sync models
    await sequelize.sync();
    console.log("Models synced");

    // 3️⃣ Create HTTP server
    const server = http.createServer(app);

    // 4️⃣ Initialize Socket.IO
    const io = initSocket(server);
    console.log("Socket.IO initialized");

    // 5️⃣ Attach global error handler
    app.use(errorHandler);

    // 6️⃣ Start server
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    // 7️⃣ Run cron immediately once at startup
    await orderStatusCron(io);

    // 8️⃣ Schedule real cron job (every minute)
    cron.schedule("* * * * *", async () => {
      console.log("Running scheduled order status cron...");
      await orderStatusCron(io);
    });

    console.log("Order status cron scheduled using node-cron (every minute).");

  } catch (error: any) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
