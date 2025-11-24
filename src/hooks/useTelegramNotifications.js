import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function useTelegramNotifications() {
  const lastMsg = useSelector(s => {
    const id = s.telegram.activeChatId;
    const msgs = s.telegram.messagesByChat[id];
    return msgs?.[msgs.length - 1];
  });

  useEffect(() => {
    if (!lastMsg) return;
    new Audio('/notification.mp3').play();
  }, [lastMsg]);
}
