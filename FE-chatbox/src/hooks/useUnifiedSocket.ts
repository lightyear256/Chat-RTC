import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { getSocket } from "../utils/socket";
import { SocketAtom } from "../stores/atoms/socketAtom";



export function useUnifiedSocket() {
  const [socket, setSocket] = useRecoilState(SocketAtom);

  useEffect(() => {
    if (!socket) {
      const token = localStorage.getItem("token") || "";
      const roomId = localStorage.getItem("hash") || "";
      const newSocket = getSocket();
      setSocket(newSocket);
    }
  }, [socket, setSocket]);

  return socket;
}
