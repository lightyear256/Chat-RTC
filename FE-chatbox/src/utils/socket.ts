let socket: WebSocket | null = null;
const listeners = new Map<string, ((data: any) => void)[]>();

export function getSocket(): WebSocket {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CONNECTING) {
    console.log("Creating new WebSocket connection...");
    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      const token = localStorage.getItem("token");
      const roomId = localStorage.getItem("hash");
      if (token && roomId) {
        socket?.send(JSON.stringify({
          type: "reconnect",
          payload: { token, roomId }
        }));
      }
      console.log("WebSocket connected");
    };

    socket.onmessage = (e) => {
      const { type, payload } = JSON.parse(e.data);
      if (listeners.has(type)) {
        listeners.get(type)!.forEach(cb => cb(payload));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
      setTimeout(() => {
        socket = null;
        getSocket(); // triggers reconnection
      }, 2000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
      socket = null;
    };
  }

  return socket;
}

export function addListener(type: string, cb: (payload: any) => void) {
  if (!listeners.has(type)) listeners.set(type, []);
  listeners.get(type)!.push(cb);
}

export function removeListener(type: string, cb: (payload: any) => void) {
  if (listeners.has(type)) {
    const arr = listeners.get(type)!;
    listeners.set(type, arr.filter(fn => fn !== cb));
  }
}
