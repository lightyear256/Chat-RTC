let socketInstance: WebSocket | null = null;

export function getSocket(): WebSocket {
  if (!socketInstance || socketInstance.readyState === WebSocket.CLOSED) {
    socketInstance = new WebSocket(`ws://localhost:5000`);
    
    // Optionally, you can add socket open/close/error handlers here
    socketInstance.onopen = () => {
      console.log("Socket connected");
      // You can send an initial auth or room join message here if needed
    };
    
    socketInstance.onclose = () => {
      console.log("Socket closed");
      // Clean up or try reconnect logic here if needed
    };
    
    socketInstance.onerror = (err) => {
      console.error("Socket error", err);
    };
  }
  return socketInstance;
}
