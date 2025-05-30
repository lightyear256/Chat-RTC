import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { haser } from "../utils/hasher";
import { useRecoilState } from "recoil";
import { HashAtom } from "../stores/atoms/hashAtom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoader } from "../hooks/useLoader";

export function JoinCreateRoom() {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const { loading:submit, runWithLoad:runSubmit } = useLoader("submit");
  const { loading:submit2, runWithLoad:runSubmit2 } = useLoader("submit-2");
  const [hash, setHash] = useRecoilState(HashAtom);
  const inpref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  async function Handler() {
    const haha = haser();
    setHash(haha);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/create`,
      {
        roomId: haha,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    setMsg(response.data.msg);
    if (response.data.success) {
      setShow(true);
    }
  }
  async function handler() {
    localStorage.setItem("hash", inpref.current?.value || "");
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/join`,
      {
        roomId: inpref.current?.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    setMsg(response.data.msg);
    if (response.data.success) {
      navigate("/joined");
    }
  }
  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center">
      {localStorage.getItem("token") ? (
        <div className="border-box border-2 border-gray-800 p-6 flex flex-col gap-y-4 rounded-md w-full max-w-md mx-auto font-mono text-white">
          <div
            className="bg-white text-black p-4 self-end rounded-md cursor-pointer"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.replace("/signin");
            }}
          >
            Logout
          </div>
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
            className={`bg-white p-3 rounded-md text-black flex items-center justify-center font-bold text-xl ${
    submit2 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={()=>{
              if (!submit2) {
                    runSubmit2(async () => {
                      await Handler();
                    });
                  }
            }}
            id="submit-2"
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
              className={`bg-white p-3 rounded-md text-black flex items-center justify-center font-bold text-xl ${
    submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => {
                if (inpref.current?.value != "") {
                  if (!submit) {
                    runSubmit(async () => {
                      await handler();
                    });
                  }
                }
              }} id="submit"
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
      ) : (
        <div className="text-white">Error 404 NOT FOUND</div>
      )}
    </div>
  );
}
