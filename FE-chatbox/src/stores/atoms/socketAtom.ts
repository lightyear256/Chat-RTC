import { atom } from "recoil";

export const SocketAtom = atom<WebSocket | null>({
  key: "SocketAtom",
  default: null,
});
