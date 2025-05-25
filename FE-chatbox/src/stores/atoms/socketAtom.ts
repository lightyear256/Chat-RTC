import { atom } from "recoil";
import { getSocket } from "../../utils/socket";

export const SocketAtom = atom<WebSocket | null>({
  key: "SocketAtom",
  default: null,
});
