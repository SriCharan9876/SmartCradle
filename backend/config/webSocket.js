import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://smart-cradle-monitor.vercel.app",
                "https://smartcradle.up.railway.app",
                "https://smartcradle.vercel.app"
            ],
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });
    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        console.log(userId);
        if (!userId) return next(new Error('Unauthorized'));
        socket.userId = userId;
        next();
    });
    const onlineUsers = new Map();
    io.on("connection", (socket) => {
        onlineUsers.set(socket.userId, socket.id);

        socket.on("join-public-room", ({ roomId }) => {
            console.log("joined")
            socket.join(roomId);
        });

        socket.on("join_cradle", (cradleId) => {
            console.log(`[Socket] Join Request: ${cradleId} (Room: cradle_${cradleId}) from ${socket.id}`);
            socket.join(`cradle_${cradleId}`);
            console.log(`Socket ${socket.id} joined room cradle_${cradleId}`);
        });
    });
    return io;
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}