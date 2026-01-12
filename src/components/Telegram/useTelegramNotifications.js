import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function useTelegramNotifications() {
  const totalUnread = useSelector((s) => s.telegram.totalUnread);

  useEffect(() => {
    if (totalUnread <= 0) return;
    if (typeof Notification === "undefined") return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
      new Notification("Нові повідомлення в Telegram-ERP", {
        body: `Непрочитаних: ${totalUnread}`,
      });
    }
  }, [totalUnread]);
}
