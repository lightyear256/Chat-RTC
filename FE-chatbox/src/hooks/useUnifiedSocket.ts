import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { getSocket } from "../utils/socket";
import { SocketAtom } from "../stores/atoms/socketAtom";



export function useUnifiedSocket() {
  const [socket, setSocket] = useRecoilState(SocketAtom);

  useEffect(() => {
    if (!socket) {
      const newSocket = getSocket();
      setSocket(newSocket);
    }
  }, [socket, setSocket]);

  return socket;
}
