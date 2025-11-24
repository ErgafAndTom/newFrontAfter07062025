
import React from "react";
import { Provider } from "react-redux";
import store from "../stores/store";


import {RouterIcon} from "lucide-react";

import { BrowserRouter as Router } from "react-router-dom";


import useTelegramNotifications from "../hooks/useTelegramNotifications";
import useTelegramWS from "../hooks/useTelegramWS";
import { initWebSocket } from "../ws";

// Хуки должны быть вызваны ТОЛЬКО внутри Provider !!!
function TelegramHooksContainer() {
  useTelegramWS();
  useTelegramNotifications();
  return null;
}

export default function TelegramProvider({ children }) {
  return (
    <Provider store={store}>
      <TelegramHooksContainer />

      {/* КОНТЕЙНЕР ДЛЯ ВІДЖЕТІВ */}
      <div id="telegram-widget-root">
        {children}
      </div>
    </Provider>
  );
}
