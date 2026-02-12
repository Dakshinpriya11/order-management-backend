// src/server.ts
import app from "./app";
import { connectDB, sequelize } from "./config/db";
import { env } from "./config/env";
import "./database/models/user.model"; // load models
import { errorHandler } from "./middleware/error.middleware";

const start = async () => {
  try {
    // Connect to DB
    await connectDB();

    // Sync all models (create tables if not exists)
    await sequelize.sync();
    console.log("Models synced");

    // Start Express server
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    // Attach global error handler (after all routes)
    app.use(errorHandler);
  } catch (error: any) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
