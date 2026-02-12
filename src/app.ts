import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// ✅ CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parser
app.use(express.json());

// 🔹 Debug logger: log every request
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// ✅ API routes
app.use("/api", routes);

// ✅ Error middleware (last)
app.use(errorHandler);

export default app;
