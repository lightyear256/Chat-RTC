let socketInstance: WebSocket | null = null;

export function getSocket(): WebSocket {
  if (!socketInstance || socketInstance.readyState === WebSocket.CLOSED) {
    socketInstance = new WebSocket(`ws://${import.meta.env.VITE_WEBSOCKET_URL}`);
    
    socketInstance.onopen = () => {
      console.log("Socket connected");
    };
    
    socketInstance.onclose = () => {
      console.log("Socket closed");
    };
    
    socketInstance.onerror = (err) => {
      console.error("Socket error", err);
    };
  }
  return socketInstance;
}
