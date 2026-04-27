import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet"; // NEW: Security headers
import cron from "node-cron";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import eventRouter from "./routes/eventRouter.js";
import { checkAndSendMessages } from "./controllers/sendReminder.js";

const app = express();
const port = process.env.PORT || 4000;

// --- MIDDLEWARE ---
// Secures your Express app by setting various HTTP headers
app.use(helmet());
app.use(express.json());

// Secure CORS for production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Allows all in dev, but restrict this in production!
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// --- ROUTES ---
// Standardized API prefix based on your frontend code
app.use("/user", userRouter);
app.use("/event", eventRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Event Reminder API is working!",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// CRITICAL SECURITY FIX: Protected manual trigger route
app.get("/api/admin/trigger-messages", async (req, res) => {
  // Require a secret admin key so internet bots can't spam your WhatsApp/Email limits
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    await checkAndSendMessages();
    console.log("Manual trigger: Messages sent successfully");
    res
      .status(200)
      .json({ success: true, message: "Messages triggered successfully!" });
  } catch (error) {
    console.error("Error triggering messages:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to send messages" });
  }
});

// --- SERVER & CRON INITIALIZATION ---
let server; // Keep a reference to the server for graceful shutdowns

async function startServer() {
  try {
    await connectDB();

    try {
      console.log("Setting up cron job...");

      // CRITICAL FIX: Added timezone specification
      cron.schedule(
        "00 5 * * *",
        async () => {
          console.log("Cron job triggered");
          await checkAndSendMessages();
        },
        {
          scheduled: true,
          timezone: "Asia/Kolkata", // Change this to your target timezone (e.g., "America/New_York")
        },
      );
    } catch (cronError) {
      console.error("Cron setup failed:", cronError.message);
    }

    server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server started on port ${port}`);
    });
  } catch (err) {
    console.error("App failed to start:", err.message);
    process.exit(1);
  }
}

// --- ERROR HANDLING & SHUTDOWN ---
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Optional: Decide if you want to process.exit(1) here depending on how critical the promise was
});

// Graceful shutdown for hosting platforms (Render, Heroku, AWS, etc.)
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      // Add logic here to close MongoDB connection if necessary: mongoose.connection.close(false, () => ...)
      process.exit(0);
    });
  }
});

startServer();
