import React, {useState} from "react";
import axios from "../../api/axiosInstance";
import "./PaidButtomProgressBar.css";
import ShiftManager from "../../components/prro/ShiftManager";

const PaidButtomProgressBar = ({ thisOrder, setShowPays, setThisOrder }) => {
  const [loading] = useState(false);


  // useEffect(() => {
  //   fetchShift();
  // }, []);

  // --- Відкрити зміну ---
  // const openShift = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post("/api/shifts/open");
  //     setShiftOpen(true);
  //   } catch (err) {
  //     console.error("Помилка відкриття зміни:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // // --- Закрити зміну ---
  // const closeShift = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post("/api/shifts/close");
  //     setShiftOpen(false);
  //   } catch (err) {
  //     console.error("Помилка закриття зміни:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // --- Створити оплату через POS Monobank ---
  const createTerminalPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.totalAmount) return;
    console.log('Creating terminal payment for order:', thisOrder.id);
    try {
      const {data} = await axios.post("/api/pos/sale", {
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.totalAmount * 100),
        currency: 980,
        terminalId: "PQ012563" // можна винести в .env чи Redux
      });
      console.log('Payment response:', data);
      if (data?.payment) {
        setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };

  return (
    <div className="payment-methods-panel adminTextBig">
      <ShiftManager
        createTerminalPayment={createTerminalPayment}
        thisOrder={thisOrder}
        setShowPays={setShowPays}
        setThisOrder={setThisOrder}
      />
    </div>
  );
};

export default PaidButtomProgressBar;
