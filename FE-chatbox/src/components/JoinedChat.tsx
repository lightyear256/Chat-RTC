import { LogOut, MessageCircle } from "lucide-react";
import { useRecoilState } from "recoil";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socket";
import { SocketAtom } from "../stores/atoms/socketAtom";
import axios from "axios";

interface Data {
  from: string;
  messages: string;
  type: string;
}

export function JoinedChat() {
  const [message, setMessage] = useState<Data[]>([]);
  const [socket, setSocket] = useRecoilState(SocketAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [name,setName]=useState("")

  async function fetcher() {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/room/fetcher`, {
      params: { roomId: localStorage.getItem("hash") },
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    if (response.data.success) {
      setMessage(response.data.messages);
      setName(response.data.name);
      console.log(response.data.name);
    }
  }

  useEffect(() => {
    if (!socket) {
      const newSocket = getSocket();
      setSocket(newSocket);
    }
    fetcher();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log("Raw WebSocket message:", data);

      if (data.type === "chat-update") {
        const msgs = data.payload;

        if (Array.isArray(msgs)) {
          setMessage((prev) => [...prev, ...msgs]);
        } else if (typeof msgs === "string") {
          setMessage((prev) => [
            ...prev,
            { from: "System", messages: msgs, type: "receiver" },
          ]);
        } else if (msgs && typeof msgs === "object") {
          setMessage((prev) => [...prev, msgs]);
        }
      }
    };

    if (socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already open. Binding message handler.");
      socket.addEventListener("message", messageHandler);
    } else {
      const openHandler = () => {
        console.log("WebSocket opened after refresh. Binding message handler.");
        socket.addEventListener("message", messageHandler);
        socket.removeEventListener("open", openHandler);
      };
      socket.addEventListener("open", openHandler);
    }

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const sender = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket not open.");
      return;
    }
    const msg = inputRef.current?.value.trim();
    if (!msg) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          token: localStorage.getItem("token"),
          message: msg,
          roomId: localStorage.getItem("hash"),
        },
      })
    );

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center">
      {localStorage.getItem("token") ?<div className="border-box border-2 border-gray-800 p-6 flex flex-col gap-y-4 rounded-md w-full max-w-md mx-auto font-mono text-white">
        <div className="flex justify-between items-center">
          <div className="flex gap-x-2 items-center">
            <MessageCircle className="text-white" />
            <div className="text-white text-2xl font-semibold">Real Time Chat</div>
          </div>
          <div
            className="flex bg-white text-black p-3 rounded-md items-center gap-x-2 cursor-pointer"
            onClick={() => {
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
              }
              setSocket(null);
              localStorage.removeItem("hash");
              window.location.replace("/dashboard")
            }}
            >
            <div className="text-lg">Leave</div>
            <LogOut />
          </div>
        </div>
            <div>{name}</div>
        <div className="text-gray-400 text-sm">
          Temporary room that expires after both users exit
        </div>
        <div className="flex p-3 justify-between bg-gray-800 rounded-md">
          <div>Room Code: {localStorage.getItem("hash")}</div>
          <div>Users: 2/2</div>
        </div>
        <div className="h-75 border-2 border-gray-800 overflow-auto flex flex-col p-4 border-box gap-y-7">
          {message.map((m, i) => {
            const uniqueKey = `${m.from}-${m.messages}-${i}`;
            return m.type === "receiver" ? (
              <div
                key={uniqueKey}
                className="p-3 bg-gray-800 self-start rounded-md flex flex-col gap-y-2"
              >
                <div className="text-sm text-gray-500 font-bold">{m.from}</div>
                <div>{m.messages}</div>
              </div>
            ) : (
              <div
                key={uniqueKey}
                className="p-3 bg-white text-black self-end rounded-md flex flex-col gap-y-2"
              >
                <div className="text-sm text-gray-500 font-bold">{m.from}</div>
                <div>{m.messages}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="flex w-full">
          <input
            type="text"
            placeholder="Enter Message"
            className="flex-1 p-3 border-2 border-gray-800 text-white rounded-l-md focus:outline-none"
            ref={inputRef}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sender();
              }
            }}
          />
          <div
            className="bg-white p-3 px-5 rounded-r-md font-bold cursor-pointer text-black"
            onClick={sender}
          >
            Send Msg
          </div>
        </div>
      </div>:<div className="text-white">Error 404 NOT FOUND</div>}
    </div>
  );
}
