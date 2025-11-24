import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { newIncomingMessage } from "../telegram/telegramSlice";

export default function useTelegramWS() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("telegram:newMessage", (msg) => {
      dispatch(newIncomingMessage(msg));
    });

    return () => socket.disconnect();
  }, []);
}
