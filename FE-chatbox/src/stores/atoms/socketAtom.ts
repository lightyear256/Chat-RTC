import { atom, atomFamily } from "recoil";
import { getSocket } from "../../utils/socket";

export const SocketAtom=atom<WebSocket|null>({
    key:"Socket atom",
    default:null
})