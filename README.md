# Chat App

A simple chat application where users can join and leave chat rooms through HTTP requests, and communicate in real-time using WebSockets.

Each chat room keeps track of connected users in the database. When a user joins, they are added to the room. When they leave or disconnect, they are removed. If a room becomes empty, it is automatically deleted from the database.

---

## 🚀 Features

- Join chat rooms via HTTP
- Leave chat rooms via HTTP
- Real-time messaging using WebSocket
- Automatically delete chat rooms when no users are left
- MongoDB-based user tracking per room
- Input validation using **Zod**

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time communication**: WebSocket (native)
- **Input validation**: Zod
- **Frontend**: React.js or any frontend framework
