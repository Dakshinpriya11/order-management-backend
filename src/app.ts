import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

//  CORS middleware
app.use(
  cors({
    origin: ['http://localhost:8081', 'http://localhost:5173'], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "idempotency-key"], 
  })
);

// Handle preflight OPTIONS requests for all routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, idempotency-key");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    return res.sendStatus(204);
  }
  next();
});

// Body parser
app.use(express.json());

// 🔹 Debug logger: log every request
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// API routes
app.use("/api", routes);

// ✅ Error middleware (last)
app.use(errorHandler);

export default app;

