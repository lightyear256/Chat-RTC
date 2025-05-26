import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import {  useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { useLoader } from "../hooks/useLoader";
import { ClipLoader } from "react-spinners";
import axios from "axios";

export function Signin() {
  
  const id = "submit";
  const { loading, runWithLoad } = useLoader(id); // Using object destructuring
  const [msg, setMsg] = useState("");

  const inpref1 = useRef<HTMLInputElement>(null);
  const inpref2 = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  async function SubmitHandler() {

      const response=await axios.post(`${import.meta.env.VITE_API_URL}/user/signin`,{
        email:inpref1.current?.value,
        password:inpref2.current?.value
      })
      if(response.data.success){
        localStorage.setItem("token",response.data.token)
        window.location.replace("/dashboard")
      }
      setMsg(response.data.msg)

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
            console.log("clicked");
            if (!loading) {
              runWithLoad(() => {
                SubmitHandler();
              });
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
