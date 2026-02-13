import http from "http";
import app from "./app";
import { connectDB, sequelize } from "./config/db";
import { env } from "./config/env";
import "./database/models/user.model"; 
import { errorHandler } from "./middleware/error.middleware";
import { orderStatusCron } from "./modules/orders/order.cron";
import { initSocket } from "./socket"; // use your socket folder setup

const start = async () => {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Sync all models (create/update tables if not exists)
    await sequelize.sync({ alter: true });
    console.log("Models synced");

    // 3️⃣ Create HTTP server
    const server = http.createServer(app);

    // 4️⃣ Initialize Socket.IO
    const io = initSocket(server);
    console.log("Socket.IO initialized");

    // 5️⃣ Attach global error handler (after all routes)
    app.use(errorHandler);

    // 6️⃣ Start server
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    // 7️⃣ Run cron immediately
    await orderStatusCron(io);

    // 8️⃣ Schedule cron every minute
    setInterval(() => orderStatusCron(io), 60 * 1000);

    console.log("Order status cron started and will run every 1 minute.");
  } catch (error: any) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
