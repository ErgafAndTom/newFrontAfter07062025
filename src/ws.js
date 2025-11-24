
import store from "./stores/store";
import { newIncomingMessage } from "./telegram/telegramSlice";

let ws = null;

export function initWebSocket() {
  ws = new WebSocket("ws://localhost:5555");

  ws.onopen = () => console.log("WS connected");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "telegram:new_message") {
      store.dispatch(
        newIncomingMessage({
          chatId: data.chatId,
          message: data.message
        })
      );
    }
  };

  ws.onclose = () => {
    console.log("WS closed, reconnect in 2s");
    setTimeout(initWebSocket, 2000);
  };
}
