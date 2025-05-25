import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { MessagesModel, RoomsModel } from "../models/model";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const wss = new WebSocketServer({ port: 8080 });

interface JWT_Payload {
  userId: string;
  name: string;
}
interface RoomDocument extends Document {
  _id: string;
  hash: string;
  user:string[]
}

// Memory map to track sockets per room and user
const roomSockets = new Map<string, Map<string, WebSocket>>();

wss.on("connection", function (socket) {
  socket.on("message", async (data) => {
    try {
      const parseData = JSON.parse(data.toString());

      if (parseData.type === "chat") {
        const user = jwt.verify(
          parseData.payload.token,
          process.env.JWT_SECRET_USER as string
        ) as JWT_Payload;

        const room = await RoomsModel.findOne({
          hash: parseData.payload.roomId,
        }) as RoomDocument;

        if (!room) {
          socket.send(
            JSON.stringify({ type: "error", message: "Room not found" })
          );
          return;
        }

        const roomId = room._id.toString();

        // Store the socket
        if (!roomSockets.has(roomId)) {
          roomSockets.set(roomId, new Map());
        }
        roomSockets.get(roomId)?.set(user.userId, socket);

        // Save the message
        await MessagesModel.create({
          from: user.userId,
          message: parseData.payload.message,
          roomId,
        });

        // Broadcast to all users in the room
        const clients = roomSockets.get(roomId);
        clients?.forEach((clientSocket, uid) => {
          if (clientSocket.readyState === socket.OPEN) {
            clientSocket.send(
              JSON.stringify({
                type: "chat-update",
                payload: {
                  message: parseData.payload.message,
                  from: user.name,
                  type: uid === user.userId ? "sender" : "receiver",
                },
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("❌ Message processing failed:", err);
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid token or malformed data",
        })
      );
    }
  });

  socket.on("close", () => {
    // Remove socket from roomSockets on disconnect
    for (const [roomId, userMap] of roomSockets.entries()) {
      for (const [userId, s] of userMap.entries()) {
        if (s === socket) {
          userMap.delete(userId);
          if (userMap.size === 0) {
            roomSockets.delete(roomId);
          }
          break;
        }
      }
    }
  });
});
