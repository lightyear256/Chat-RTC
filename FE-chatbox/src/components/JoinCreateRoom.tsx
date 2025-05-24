import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { haser } from "../utils/hasher";
import { getSocket } from "../utils/socket";
import { useRecoilState } from "recoil";
import { HashAtom } from "../stores/atoms/hashAtom";
import { Link, useNavigate } from "react-router-dom";
import { SocketAtom } from "../stores/atoms/socketAtom";

export function JoinCreateRoom() {
  const [socket,setSocket]=useRecoilState(SocketAtom);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  const [hash, setHash] = useRecoilState(HashAtom);
  const inpref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center">
      <div className="border-box border-2 border-gray-800 p-6 flex flex-col gap-y-4 rounded-md w-full max-w-md mx-auto font-mono text-white">
        <div className="flex gap-x-2 items-center">
          <MessageCircle className="text-white" />
          <div className="text-white text-2xl font-semibold">
            Real Time Chat
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          Temporary room that expires after both users exit
        </div>
        <div
          className="bg-white rounded-md text-center p-3 cursor-pointer font-bold w-full text-black  "
          onClick={async () => {
            const hashs = haser();

            if (!show) {
              setHash(hashs);
            }
            setShow(true);
            if(!socket){
              setSocket(getSocket());
            }
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: "create-room",
                  payload: {
                    roomId: hashs,
                  },
                })
              );
              socket.onmessage = (event: MessageEvent) => {
                const data: {
                  type: string;
                  payload: { success: boolean; token?: string; msg: string };
                } = JSON.parse(event.data);
                if (data.type === "signin-response" && !data.payload.success) {
                  setMsg("Failed to create room");
                } else {
                  setMsg("Room created successfully");
                }
              };
            }
          }}
        >
          Create New Room
        </div>
        <div className="flex  w-full">
          <input
            type="text"
            placeholder="Enter Room Code"
            className=" flex-1 p-3 border-2 border-gray-800 text-white rounded-l-md focus:outline-none "
            ref={inpref}
          />
          <div
            className="bg-white text-black p-3 rounded-r-md cursor-pointer font-bold"
            onClick={() => {
              if(!socket){
                setSocket(getSocket());
              }
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: "join",
                    payload: {
                      token: localStorage.getItem("token"),
                      roomId: inpref.current?.value,
                    },
                  })
                );
                localStorage.setItem("hash", inpref.current?.value as string);

                socket.onmessage = (event: MessageEvent) => {
                  const data: {
                    type: string;
                    payload: { success: boolean; msg: string };
                  } = JSON.parse(event.data);
                  console.log(data);
                  if (data.type === "join-response" && !data.payload.success) {
                    setMsg("incorrect code");
                  } else {
                    setMsg("Joining...");
                    navigate("/joined", { replace: true });
                  }
                };
              }
            }}
          >
            Join Room
          </div>
        </div>
        {show && (
          <div className=" w-full bg-gray-800 p-5 h-32 rounded-md flex flex-col justify-center items-center transition-all duration-300 ease-in-out">
            <div className="font-mono text-md text-gray-500">
              Share this With your friend
            </div>
            <div className="text-3xl font-bold text-white">{hash}</div>
          </div>
        )}
        <div className="text-white text-sm">{msg}</div>
      </div>
    </div>
  );
}
