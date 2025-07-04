import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { useLoader } from "../hooks/useLoader";
import { ClipLoader } from "react-spinners";
import axios from "axios";

export function Signin() {
  const { loading, runWithLoad } = useLoader("submit"); // Using object destructuring
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const inpref1 = useRef<HTMLInputElement>(null);
  const inpref2 = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(()=>{
    if(localStorage.getItem("token")){
     window.location.replace("/dashboard");
    }
  },[])
  async function SubmitHandler() {
    try {
      setErrors({});

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/signin`,
        {
          email: inpref1.current?.value,
          password: inpref2.current?.value,
        }
      );
      setMsg(response.data.msg);
        localStorage.setItem("token", response.data.token);
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 2000);
      
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.msg?.fieldErrors) {
        setErrors(data.msg.fieldErrors);
      } else if (typeof data?.msg === "string") {
        setErrors({ general: [data.msg] });
        console.log(errors);
      } else {
      }
    }
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
          {errors.email && <p className="text-red-500">{errors.email[0]}</p>}
          <Input placeholder="Password" type="Password" refer={inpref2} />
          {errors.password && (
            <p className="text-red-500">{errors.password[0]}</p>
          )}
        </div>
        {msg && <p className="text-green-400">{msg}</p>}
        {errors.general && <p className="text-red-400">{errors.general[0]}</p>}
        {/* <div className="text-white texl-sm">{msg}</div> */}
        <div
          className={`bg-white p-3 rounded-md text-black flex items-center justify-center font-bold text-xl ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!loading) {
              console.log("clicked");
              runWithLoad(async () => await SubmitHandler());
            }
          }}
          id={"submit"}
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
