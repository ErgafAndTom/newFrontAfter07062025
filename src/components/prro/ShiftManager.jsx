import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import "./ShiftManager.css";

const ShiftManager = ({ currentUser }) => {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const terminalId = "T001"; // можна підставляти з налаштувань/Redux

  const fetchCurrentShift = async () => {
    try {
      const { data } = await axios.get("/api/pos/current", {
        params: { terminalId }
      });
      setShift(data || null);
    } catch (err) {
      console.error("Помилка отримання зміни:", err);
    }
  };

  const openShift = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/pos/openShift", {
        terminalId,
        userId: currentUser?.id
      });
      setShift(data);
    } catch (err) {
      console.error("Помилка відкриття зміни:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeShift = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/pos/closeShift", {
        shiftId: shift.shiftId,
        userId: currentUser?.id
      });
      setShift(data);
    } catch (err) {
      console.error("Помилка закриття зміни:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  return (
    <div className="shift-manager">
      <h3>Стан зміни</h3>
      {shift ? (
        <div className="shift-info">
          <p><strong>ID:</strong> {shift.shiftId}</p>
          <p><strong>Термінал:</strong> {shift.terminalId}</p>
          <p><strong>Касир:</strong> {shift.userId}</p>
          <p><strong>Статус:</strong> {shift.status}</p>
          {shift.openedAt && <p><strong>Відкрито:</strong> {new Date(shift.openedAt).toLocaleString()}</p>}
          {shift.closedAt && <p><strong>Закрито:</strong> {new Date(shift.closedAt).toLocaleString()}</p>}
          {shift.status === "OPEN" && (
            <button disabled={loading} onClick={closeShift} className="close-btn">
              {loading ? "Закриваємо..." : "Закрити зміну"}
            </button>
          )}
        </div>
      ) : (
        <button disabled={loading} onClick={openShift} className="open-btn">
          {loading ? "Відкриваємо..." : "Відкрити зміну"}
        </button>
      )}
    </div>
  );
};

export default ShiftManager;
