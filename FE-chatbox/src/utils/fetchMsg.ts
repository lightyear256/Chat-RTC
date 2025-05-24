export function fetchMsg(
  socket: WebSocket,
  callback: (result: { success: boolean; messages: any[] }) => void
) {
  const token = localStorage.getItem("token");
  const roomId = localStorage.getItem("hash");

  const sendFetchRequest = () => {
    socket.send(JSON.stringify({
      type: "fetch-msg",
      payload: { token, roomId }
    }));
  };

  if (socket.readyState === WebSocket.OPEN) {
    sendFetchRequest();
  } else {
    socket.addEventListener("open", sendFetchRequest, { once: true });
  }

  const onResponse = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === "fetch-msg-response") {
      callback(data.payload);
      socket.removeEventListener("message", onResponse);
    }
  };

  socket.addEventListener("message", onResponse);
}
