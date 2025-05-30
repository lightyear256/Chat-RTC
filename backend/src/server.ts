import { Connection } from "./config/db";
import { app } from "./index";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { MessagesModel, RoomsModel } from "./models/model";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const server = http.createServer(app);
console.log(server);
const wss = new WebSocketServer({ server });

interface JWT_Payload {
  userId: string;
  name: string;
}

interface RoomDocument extends Document {
  _id: string;
  hash: string;
  users: string[];
}

const roomSockets = new Map<string, Map<string, WebSocket>>();

wss.on("connection", function (socket) {
  socket.on("message", async (data) => {
    try {
      const parseData = JSON.parse(data.toString());
      if (parseData.type === "joiners") {
        const hash = parseData.payload.roomId;
        const room = await RoomsModel.findOne({
          hash: hash,
        });
        if (room) {
          const connected = room.users.length;
          const clients = roomSockets.get(hash);
          clients?.forEach((clientSocket, uid) => {
            if (clientSocket.readyState === socket.OPEN) {
              clientSocket.send(
                JSON.stringify({
                  type: "joiner-response",
                  payload: {
                    connected: connected,
                  },
                })
              );
            }
          });
        }
      }

      if (parseData.type === "remover") {
        const user = jwt.verify(
          parseData.payload.token,
          process.env.JWT_SECRET_USER as string
        ) as JWT_Payload;
        const hash = parseData.payload.roomId;

        const room = await RoomsModel.findOneAndUpdate(
          { hash: hash },
          { $pull: { users: user.userId } },
          { new: true }
        );
        if (room) {
          room.users.find((e) => {
            e.toString() === user.userId.toString();
          });
          console.log(room.users.length===0);
          if(room.users.length===0){
            await RoomsModel.deleteOne({
              hash:hash
            })
          }
        }
        
      }

      if (parseData.type === "chat") {
        const user = jwt.verify(
          parseData.payload.token,
          process.env.JWT_SECRET_USER as string
        ) as JWT_Payload;
        // console.log("user  bjbj "+JSON.stringify(user));
        // console.log(JSON.stringify(parseData.payload));
        const room = (await RoomsModel.findOne({
          hash: parseData.payload.roomId,
        })) as RoomDocument;

        if (!room) {
          socket.send(
            JSON.stringify({ type: "error", message: "Room not found" })
          );
          return;
        }

        const roomId = room._id.toString();
        const connected = room.users.length;

        if (!roomSockets.has(roomId)) {
          roomSockets.set(roomId, new Map());
        }
        roomSockets.get(roomId)?.set(user.userId, socket);

        await MessagesModel.create({
          from: user.userId,
          message: parseData.payload.message,
          roomId,
        });
        // console.log(" nwlfnekjg"+ user.name);
        const clients = roomSockets.get(roomId);
        clients?.forEach((clientSocket, uid) => {
          if (clientSocket.readyState === socket.OPEN) {
            clientSocket.send(
              JSON.stringify({
                type: "chat-update",
                payload: {
                  messages: parseData.payload.message,
                  from: user.name,
                  type: uid === user.userId ? "sender" : "receiver",
                  connected: connected,
                },
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("Message processing failed:", err);
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid token or malformed data",
        })
      );
    }
  });

  socket.on("close", () => {
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

const startServer = async () => {
  await Connection();
  server.listen(5000, () => {
    console.log(`Express + WebSocket server running on ${process.env.port}`);
  });
};

startServer();
