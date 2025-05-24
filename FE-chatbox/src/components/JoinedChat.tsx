import { LogOut, MessageCircle } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { HashAtom } from "../stores/atoms/hashAtom";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socket";
import { fetchMsg } from "../utils/fetchMsg";
import { SocketAtom } from "../stores/atoms/socketAtom";
export function JoinedChat() {
  const hash = useRecoilValue(HashAtom);
  const [message, setMessage] = useState<any[]>([]);
  const [socket, setSocket] = useRecoilState(SocketAtom);
  const navigate = useNavigate();
  const inpref = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function isSocketOpen(sock: WebSocket | null): sock is WebSocket {
    return sock !== null && sock.readyState === WebSocket.OPEN;
  }

  useEffect(() => {
    const newSocket = socket;
    if (!newSocket) return;

    const messageHandler = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log("📨 Received socket message:", data);

      if (data.type === "chat-update") {
        const msgs = data.payload?.messages;
        if (Array.isArray(msgs)) {
          setMessage((prev) => [...prev, ...msgs]);
        } else if (msgs && typeof msgs === "object") {
          setMessage((prev) => [...prev, msgs]);
        } else {
          console.warn("Invalid chat-update payload:", data);
        }
      }
    };

    newSocket.addEventListener("message", messageHandler);

    fetchMsg(newSocket, (data) => {
      if (data.success) {
        setMessage(data.messages);
      }
    });

    return () => {
      newSocket.removeEventListener("message", messageHandler);
    };

  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

 

  function sender() {
    const msg = inpref.current?.value.trim();
    if (!msg) return;

    if (!isSocketOpen(socket)) {
      console.warn("Socket not open. Message not sent.");
      return; 
    }

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

    if (inpref.current) {
      inpref.current.value = "";
    }
  }

  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center">
      <div className="border-box border-2 border-gray-800 p-6 flex flex-col gap-y-4 rounded-md w-full max-w-md mx-auto font-mono text-white">
        <div className="flex justify-between items-center">
          <div className="flex gap-x-2 items-center">
            <MessageCircle className="text-white" />
            <div className="text-white text-2xl font-semibold">
              Real Time Chat
            </div>
          </div>
          <div
            className="flex bg-white text-black p-3 rounded-md items-center gap-x-2 cursor-pointer"
            onClick={() => {
              if (socket && isSocketOpen(socket)) {
                socket.removeEventListener("message", () => {}); 
                socket.close(); 
              }
              setSocket(null); 
              localStorage.removeItem("hash");
              navigate("/dashboard");
            }}
          >
            <div className="text-lg">Leave</div>
            <LogOut />
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          Temporary room that expires after both users exit
        </div>
        <div className="flex p-3 justify-between bg-gray-800 rounded-md">
          <div>Room Code: {localStorage.getItem("hash")}</div>
          <div>Users:2/2</div>
        </div>
        <div className="h-75 border-2 border-gray-800 overflow-auto flex flex-col p-4 border-box gap-y-7">
          {message.map((m) => {
            const uniqueKey = `${m.from}-${m.message}-${
              m.timestamp || Math.random()
            }`;
            return m.type === "receiver" ? (
              <div
                key={uniqueKey}
                className="p-3 bg-gray-800 self-start rounded-md flex flex-col gap-y-2"
              >
                <div className="text-sm text-gray-500 font-bold">{m.from}</div>
                <div>{m.message}</div>
              </div>
            ) : (
              <div
                key={uniqueKey}
                className="p-3 bg-white text-black self-end rounded-md flex flex-col gap-y-2"
              >
                <div className="text-sm text-gray-500 font-bold">{m.from}</div>
                <div>{m.message}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="flex w-full">
          <input
            type="text"
            placeholder="Enter Message"
            className=" flex-1 p-3 border-2 border-gray-800 text-white rounded-l-md focus:outline-none "
            ref={inpref}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sender();
              }
            }}
          />
          <div
            className="bg-white p-3 px-5 rounded-r-md font-bold cursor-pointer font text-black"
            onClick={sender}
          >
            Send Msg
          </div>
        </div>
      </div>
    </div>
  );
}
