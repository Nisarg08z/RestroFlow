import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import connectDB from "./db/index.js";
import {app} from './app.js'
import { setIO } from "./utils/socket.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
    httpServer.listen(process.env.PORT || 8000, () => {})
})
.catch((err) => {
    console.error("MONGO db connection failed !!! ", err);
})
