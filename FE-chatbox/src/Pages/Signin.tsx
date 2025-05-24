import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { Link, replace, useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { getSocket } from "../utils/socket";
import { useLoader } from "../hooks/useLoader";
import { ClipLoader } from "react-spinners";
import { useRecoilState } from "recoil";
import { SocketAtom } from "../stores/atoms/socketAtom";

export function Signin() {
  // useEffect(() => {
  //   getSocket();
  // }, []);
  const id = "submit";
  const { loading, runWithLoad } = useLoader(id); // Using object destructuring
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [socket,setSocket]=useRecoilState(SocketAtom);

  //   const [joined, setJoined] = useState(false);
  const inpref1 = useRef<HTMLInputElement>(null);
  const inpref2 = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  function SubmitHandler() {
    setMsg("");
    const msgs = {
      type: "signin",
      payload: {
        email: inpref1.current?.value,
        password: inpref2.current?.value,
      },
    };
   if(!socket){
    setSocket(getSocket());
    return;
   }
    socket.send(JSON.stringify(msgs));

    socket.onmessage = (event: MessageEvent) => {
      const data: {
        type: string;
        payload: { success: boolean; token?: string; msg: string };
      } = JSON.parse(event.data);
      if (data.type === "signin-response" && !data.payload.success) {
        setTimeout(() => {
          setMsg(data.payload.msg);
          navigate("/signin");
        }, 1000);
        console.log(msg);
      } else {
        if (data.payload.token) {
          localStorage.setItem("token", data.payload.token);
          console.log(localStorage.getItem("token"));
        }
        setTimeout(() => {
          setMsg(data.payload.msg);
          window.location.replace("/dashboard");
        }, 1000);
      }
    };
  }
  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center">
      <div className="border-box border-2 border-gray-800 p-6 flex flex-col  gap-y-4 rounded-md w-full max-w-md mx-auto font-mono text-white">
        <div className="flex gap-x-2 items-center">
          <MessageCircle className="text-white" />
          <div className="text-white text-2xl font-semibold">
            Real Time Chat
          </div>
        </div>
        <div className="text-2xl font-bold text-center">Sign In</div>
        <div className="flex flex-col gap-y-2">
          <Input placeholder="Email" type="text" refer={inpref1} />
          <Input placeholder="Password" type="Password" refer={inpref2} />
        </div>
        <div className="text-white texl-sm">{msg}</div>
        <div
          className={` bg-white p-3 rounded-md text-black flex items-center justify-center font-bold text-xl  ${
            loading ? "opacity-50" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!loading) {
              runWithLoad(
                () =>
                  new Promise<void>((resolve) => {
                    setTimeout(() => {
                      SubmitHandler();
                      resolve();
                    }, 5000);
                  })
              );
            }
          }}
          id={id}
        >
          {loading ? (
            <ClipLoader
              color="#000000"
              loading={loading}
              size={25}
              className="mx-auto"
            />
          ) : (
            "Submit"
          )}
        </div>
        <div className="text-sm text-white">
          Need to{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Register?
          </span>
        </div>
      </div>
    </div>
  );
}
