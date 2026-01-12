import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeDrawer } from "../../telegram/telegramSlice";
import TelegramChatList from "./TelegramChatList";
import TelegramChatWindow from "./TelegramChatWindow";
import "./telegram.css";

const TelegramDrawer = () => {
  const dispatch = useDispatch();

  // 🔥 ОСНОВНЕ: тут зʼявляється isOpen
  const isOpen = useSelector((state) => state.telegram.drawerOpen);

  if (!isOpen) {
    // можеш забрати цей return, якщо хочеш щоб блок завжди в DOM
    return null;
  }

  return (
    <>
      {/* затемнення фону */}
      <div
        className="telegram-backdrop"
        onClick={() => dispatch(closeDrawer())}
      />

      {/* сам виїжджаючий блок */}
      <div className="telegram-drawer open">
        <button
          className="telegram-close-btn"
          onClick={() => dispatch(closeDrawer())}
        >
          ✕
        </button>

        <div className="telegram-drawer-inner">
          <div className="telegram-left">
            <TelegramChatList />
          </div>
          <div className="telegram-right">
            <TelegramChatWindow />
          </div>
        </div>
      </div>
    </>
  );
};

export default TelegramDrawer;
