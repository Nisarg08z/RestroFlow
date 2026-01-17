import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { socketMiddleware } from "./utils/socket.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(socketMiddleware);

import adminRouter from "./routes/adminRoute.js"
import restaurantRouter from "./routes/restaurantRoute.js"
import restaurantRequestRouter from "./routes/restaurantRequestRoute.js"
import subscriptionRouter from "./routes/subscriptionRoute.js"
import invoiceRouter from "./routes/invoiceRoute.js"
import ticketRouter from "./routes/ticketRoute.js"

app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/restaurant", restaurantRouter)
app.use("/api/v1/requests", restaurantRequestRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/invoices", invoiceRouter)
app.use("/api/v1/tickets", ticketRouter)

app.use(errorHandler)

export { app };
