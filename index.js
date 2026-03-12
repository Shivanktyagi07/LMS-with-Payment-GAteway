import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//Gloal rate limiter:
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100, //limit each ip to 100 request/window(per 15 minutes.)
  message: "Too many request from same IP ! one mre try please ",
});

//Security Middlewares:
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use("/api", limiter);
app.use(cookieParser());

//logging middleware:
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

//Body parser middleware:
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//GLobal error handler:
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "developement" && { stack: err.stack }),
  });
});

//cors configuration:
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5143",
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  }),
);

//404 handler:
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "This route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} in ${process.env.NODE_ENV} mode `);
});
