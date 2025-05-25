// components/AppInitializer.tsx
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { SocketAtom } from "../stores/atoms/socketAtom";
import { getSocket } from "../utils/socket";

export function AppInitializer() {
  const setSocket = useSetRecoilState(SocketAtom);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hash = localStorage.getItem("hash");

    if (token && hash) {
      const socket = getSocket();
      setSocket(socket);
    }
  }, []);

  return null;
}
