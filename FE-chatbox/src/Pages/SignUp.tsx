import { MessageCircle, Divide } from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { getSocket } from "../utils/socket";
import { useRecoilState } from "recoil";
import { SocketAtom } from "../stores/atoms/socketAtom";

export function SignUp() {
  const [msg, setMsg] = useState("");
  const [socket,setSocket]=useRecoilState(SocketAtom);

  
  const inpref1 = useRef<HTMLInputElement>(null);
  const inpref2 = useRef<HTMLInputElement>(null);
  const inpref3 = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  function SubmitHandler() {
    const msgs = {
      type: "register",
      payload: {
        email: inpref1.current?.value,
        password: inpref2.current?.value,
        name: inpref3.current?.value,
      },
    };
    if(!socket){
      setSocket(getSocket())
      return;
    }
    socket.send(JSON.stringify(msgs));
    socket.onmessage = (event: MessageEvent) => {
      const data: {
        type: string;
        payload: { success: boolean; msg: "string" };
      } = JSON.parse(event.data);
      if (data.type === "signup-response" && !data.payload.success) {
        setMsg(data.payload.msg);
        navigate("/signup");
      } else {
        setTimeout(() => {
          setMsg(data.payload.msg);
          navigate("/Signin");
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
        <div className="text-2xl font-bold text-center">Sign Up</div>
        <div className="flex flex-col gap-y-2">
          <Input placeholder="Email" type="text" refer={inpref1} />
          <Input placeholder="Password" type="Password" refer={inpref2} />
          <Input placeholder="Name" type="text" refer={inpref3} />
        </div>
        <div className="text-white text-sm">{msg}</div>
        <div
          className="bg-white p-3 rounded-md text-black flex items-center justify-center font-bold text-xl cursor-pointer"
          onClick={SubmitHandler}
        >
          Submit
        </div>
        <div className="text-sm text-white">
          Already Signedup{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => {
              navigate("/Signin");
            }}
          >
            Login?
          </span>
        </div>
      </div>
    </div>
  );
}
