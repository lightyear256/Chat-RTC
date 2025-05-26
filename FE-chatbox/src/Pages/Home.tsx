import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function Home() {
    const navigate=useNavigate();
  return (
    <div className="h-screen w-screen bg-black flex flex-col  gap-y-4 justify-center items-center font-mono">
      <div className=" flex flex-col justify-center items-center md:flex-row gap-x-2">
        <MessageCircle className="text-white" size={50} />
        <div className="text-5xl text-white font-mono text-center font-bold">
          REAL TIME CHAT APPLICATION
        </div>
      </div>
      <div className="flex gap-x-3">
        <div className="pl-4 pr-4 pt-2 pb-2 bg-white rounded-md font-bold cursor-pointer" onClick={()=>{
          if(localStorage.getItem("token")){
            window.location.replace("/dashboard")
          }
          else{
          navigate('/signin')
          }
        }}>Sign-in</div>
        <div className="pl-4 pr-4 pt-2 pb-2 bg-white rounded-md font-bold cursor-pointer" onClick={()=>{
          if(localStorage.getItem("token")){
            window.location.replace("/dashboard")
          }
          else{
          navigate('/signup')
          }
        }}>Sign-up</div>
      </div>
    </div>
  );
}
