
import store from "./stores/store";
import { newIncomingMessage } from "./telegram/telegramSlice";

let ws = null;

function buildWsUrl() {
  const host = window.location.hostname;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  if (host === "localhost" || host === "127.0.0.1") {
    return `${proto}://${host}:5555`;
  }
  return `${proto}://${host}/ws`;
}

export function initWebSocket() {
  ws = new WebSocket(buildWsUrl());

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

    if (data.type === "payment_status_update") {
      window.dispatchEvent(
        new CustomEvent('paymentStatusUpdate', { detail: data })
      );
    }
  };

  ws.onclose = () => {
    console.log("WS closed, reconnect in 2s");
    setTimeout(initWebSocket, 2000);
  };
}
