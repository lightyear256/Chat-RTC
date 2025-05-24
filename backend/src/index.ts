import { WebSocketServer, WebSocket } from "ws";
import { MessagesModel, RoomsModel, UserModel } from "./models/model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Connection } from "./config/db";
import { date } from "zod";
import mongoose from "mongoose";

const wss = new WebSocketServer({ port: 8080 });
Connection();
interface Users {
  UserId: string;
  socket: WebSocket;
  roomId: string;
  name: string;
}
interface Userpayload {
  userId: string;
  email: string;
  name: string;
}
const sockets: Users[] = [];

function addOrUpdateSocket(user: Users) {
  const index = sockets.findIndex((s) => s.UserId === user.UserId);
  if (index !== -1) {
    sockets[index].socket = user.socket;
    sockets[index].roomId = user.roomId;
    sockets[index].name = user.name;
  } else {
    sockets.push(user);
  }
}

wss.on("connection", (socket) => {
  socket.on("close", () => {
    const index = sockets.findIndex((s) => s.socket === socket);
    if (index !== -1) {
      sockets.splice(index, 1);
    }
  });

  socket.on("message", async (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    console.log(message.toString());
    console.log(parsedMessage);
    if (parsedMessage.type === "reconnect") {
      try {
        const user: JwtPayload = jwt.verify(
          parsedMessage.payload.token,
          process.env.JWT_SECRET_USER as string
        ) as JwtPayload;
        const roomId = parsedMessage.payload.roomId;

        const isExist = await RoomsModel.findOne({ hash: roomId });
        if (isExist) {
          const index = sockets.findIndex((s) => s.UserId === user.userId);
          if (index !== -1) {
            sockets.splice(index, 1);
          }
          addOrUpdateSocket({
            UserId: user.userId,
            socket,
            roomId: parsedMessage.payload.roomId,
            name: user.name,
          });

          socket.send(
            JSON.stringify({
              type: "reconnect-response",
              payload: {
                success: true,
                msg: "Reconnected successfully",
              },
            })
          );
        } else {
          socket.send(
            JSON.stringify({
              type: "reconnect-response",
              payload: {
                success: false,
                msg: "Room not found",
              },
            })
          );
        }
      } catch (e) {
        socket.send(
          JSON.stringify({
            type: "reconnect-response",
            payload: {
              success: false,
              msg: "Issue in reconnection",
            },
          })
        );
      }
    }
    if (parsedMessage.type === "join") {
      // For join
      const user: Userpayload = jwt.verify(
        parsedMessage.payload.token,
        process.env.JWT_SECRET_USER as string
      ) as Userpayload;

      const room = await RoomsModel.findOne({
        hash: parsedMessage.payload.roomId,
      });
      if (!room) {
        return socket.send(
          JSON.stringify({
            type: "join-response",
            payload: { success: false, msg: "Room not found" },
          })
        );
      }

      // Update room users in DB
      await RoomsModel.updateOne(
        { hash: parsedMessage.payload.roomId },
        { $addToSet: { users: new mongoose.Types.ObjectId(user.userId) } }
      );

      addOrUpdateSocket({
        UserId: user.userId,
        socket,
        roomId: parsedMessage.payload.roomId,
        name: user.name,
      });

      socket.send(
        JSON.stringify({
          type: "join-response",
          payload: { success: true },
        })
      );

      // For reconnect
      try {
        const user: JwtPayload = jwt.verify(
          parsedMessage.payload.token,
          process.env.JWT_SECRET_USER as string
        ) as JwtPayload;
        const roomId = parsedMessage.payload.roomId;

        const room = await RoomsModel.findOne({ hash: roomId });
        if (!room) throw new Error("Room not found");

        addOrUpdateSocket({
          UserId: user.userId,
          socket,
          roomId,
          name: user.name,
        });

        socket.send(
          JSON.stringify({
            type: "reconnect-response",
            payload: { success: true, msg: "Reconnected successfully" },
          })
        );
      } catch {
        socket.send(
          JSON.stringify({
            type: "reconnect-response",
            payload: { success: false, msg: "Issue in reconnection" },
          })
        );
      }
    }

    if (parsedMessage.type === "chat") {
      console.log(sockets + " sockets");
      const user: JwtPayload = jwt.verify(
        parsedMessage.payload.token,
        process.env.JWT_SECRET_USER as string
      ) as JwtPayload;
      try {
        const room = await RoomsModel.findOne({
          hash: parsedMessage.payload.roomId,
        });
        if (!room) {
          throw new Error("Room not found");
        }
        const data = {
          from: user.userId,
          message: parsedMessage.payload.message,
          roomId: room._id,
        };
        console.log(data + "    wndjeqbfjeqbfk");
        await MessagesModel.create(data);
        socket.send(
          JSON.stringify({
            type: "chat-response",
            payload: {
              success: true,
              sockets: sockets,
            },
          })
        );
        for (let i = 0; i < sockets.length; i++) {
          if (sockets[i].roomId === parsedMessage.payload.roomId) {
            const senderId = sockets[i].UserId.toString();
            const fromId = user.userId.toString();
            if (sockets[i].socket.readyState === WebSocket.OPEN) {
              sockets[i].socket.send(
                JSON.stringify({
                  type: "chat-update",
                  payload: {
                    success: true,
                    messages: {
                      message: parsedMessage.payload.message,
                      from: user.name,
                      roomId: room.hash,
                      type: senderId === fromId ? "sender" : "receiver",
                    },
                  },
                })
              );
            }
          }
        }
      } catch (error) {
        console.log(error);
        socket.send(
          JSON.stringify({
            type: "chat-response",
            payload: {
              success: false,
              error: error,
            },
          })
        );
      }
    }
    if (parsedMessage.type === "fetch-msg") {
      const data: JwtPayload = jwt.verify(
        parsedMessage.payload.token,
        process.env.JWT_SECRET_USER as string
      ) as JwtPayload;
      try {
        const room = await RoomsModel.findOne({
          hash: parsedMessage.payload.roomId,
        });
        if (!room) {
          throw new Error("Room not found");
        }

        const messagess = await MessagesModel.find({
          roomId: room._id,
        }).populate<{ from: { _id: string; name: string } }>("from");
        console.log("drhdehetdhrsth" + messagess);
        if (messagess) {
          socket.send(
            JSON.stringify({
              type: "fetch-msg-response",
              payload: {
                success: true,
                messages: messagess.map((msg) => {
                  const senderId = data.userId.toString();
                  const fromId = msg.from._id.toString();
                  return {
                    message: msg.message,
                    from: msg.from.name,
                    roomId: room.hash,
                    type: senderId === fromId ? "sender" : "receiver",
                  };
                }),
              },
            })
          );
        }
      } catch (error) {
        socket.send(
          JSON.stringify({
            type: "fetch-msg-response",
            payload: {
              success: false,
              messages: error,
            },
          })
        );
      }
    }
    if (parsedMessage.type === "register") {
      try {
        await UserModel.create({
          email: parsedMessage.payload.email,
          password: await bcrypt.hash(parsedMessage.payload.password, 5),
          name: parsedMessage.payload.name,
        });
        socket.send(
          JSON.stringify({
            type: "signup-response",
            payload: {
              success: true,
            },
          })
        );
      } catch (e) {
        socket.send(
          JSON.stringify({
            type: "signup-response",
            payload: {
              success: false,
              msg: "internal server error " + e,
            },
          })
        );
      }
    }
    if (parsedMessage.type === "signin") {
      try {
        const user = await UserModel.findOne({
          email: parsedMessage.payload.email,
        });
        if (user) {
          const decoded = await bcrypt.compare(
            parsedMessage.payload.password,
            user.password
          );
          if (decoded) {
            socket.send(
              JSON.stringify({
                type: "signin-response",
                payload: {
                  success: true,
                  token: jwt.sign(
                    { userId: user._id, email: user.email, name: user.name },
                    process.env.JWT_SECRET_USER as string
                  ),
                },
              })
            );
          } else {
            socket.send(
              JSON.stringify({
                type: "signin-response",
                payload: {
                  success: false,
                  msg: "Invalid Password or Email",
                },
              })
            );
          }
        } else {
          socket.send(
            JSON.stringify({
              type: "signin-response",
              payload: {
                success: false,
                msg: "Invalid Password or Email",
              },
            })
          );
        }
      } catch (e) {
        socket.send(
          JSON.stringify({
            type: "signin-response",
            payload: {
              success: false,
              msg: "Internal server Error",
            },
          })
        );
      }
    }
    if (parsedMessage.type === "create-room") {
      console.log(parsedMessage.payload.roomId);
      try {
        await RoomsModel.create({
          hash: parsedMessage.payload.roomId,
        });
        socket.send(
          JSON.stringify({
            type: "room-response",
            payload: {
              success: true,
              msg: "Room created",
            },
          })
        );
      } catch (e) {
        socket.send(
          JSON.stringify({
            type: "room-response",
            payload: {
              success: false,
              msg: "Internal server Error " + e,
            },
          })
        );
      }
    }
  });
});
