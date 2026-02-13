// src/server.ts
import app from "./app";
import { connectDB, sequelize } from "./config/db";
import { env } from "./config/env";
import "./database/models/user.model"; // load models
import { errorHandler } from "./middleware/error.middleware";
import { orderStatusCron } from "./modules/orders/order.cron";

const start = async () => {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Sync all models (create/update tables if not exists)
    await sequelize.sync({ alter: true });
    console.log("Models synced");

    // 3️⃣ Start Express server
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    // 4️⃣ Attach global error handler (after all routes)
    app.use(errorHandler);

    // 5️⃣ Run order status cron immediately
    await orderStatusCron();

    // 6️⃣ Schedule cron to run every 1 minute
    setInterval(orderStatusCron, 60 * 1000);

    console.log("Order status cron started and will run every 1 minute.");
  } catch (error: any) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
