import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import connectDB from "./db/index.js";
import {app} from './app.js'
import { setIO } from "./utils/socket.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cron from "node-cron";
import { sendRenewalReminders, sendExpirationNotifications } from "./utils/renewalReminder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config({
    path: join(__dirname, '../.env')
})

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(",").map(o => o.trim()).filter(Boolean) || "*",
        credentials: true
    }
});

setIO(io);

io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
});

connectDB()
.then(() => {
    httpServer.listen(process.env.PORT || 8000, () => {
        console.log(`Server running on port ${process.env.PORT || 8000}`)
    })
    cron.schedule("0 9 * * *", async () => {
        console.log("Running daily renewal reminder job...")
        try {
            await sendRenewalReminders()
            console.log("Renewal reminders sent successfully")
        } catch (error) {
            console.error("Error in renewal reminder cron job:", error)
        }
    })

    cron.schedule("0 10 * * *", async () => {
        console.log("Running expiration notification job...")
        try {
            await sendExpirationNotifications()
            console.log("Expiration notifications sent successfully")
        } catch (error) {
            console.error("Error in expiration notification cron job:", error)
        }
    })

    console.log("Cron jobs scheduled for renewal reminders and expiration notifications")
})
.catch((err) => {
    console.error("MONGO db connection failed !!! ", err);
})
