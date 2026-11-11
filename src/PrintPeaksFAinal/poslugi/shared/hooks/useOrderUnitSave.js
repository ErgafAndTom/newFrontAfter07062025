import { useCallback } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { withEditTarget } from "../editTarget";

/**
 * Hook for saving order units to /orderUnits/OneOrder/OneOrderUnitInOrder
 * @param {Object} thisOrder - Current order object
 * @param {Function} setThisOrder - Setter for order
 * @param {Function} setSelectedThings2 - Setter for selected order units
 * @param {Function} onSuccess - Callback on successful save
 * @param {Function} setEditingOrderUnit - Optional setter to clear editing state
 * @returns {{ saveOrderUnit: Function, error: Error|null }}
 */
export function useOrderUnitSave(
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  onSuccess,
  setEditingOrderUnit
) {
  const navigate = useNavigate();

  /**
   * Save or update an order unit
   * @param {Object} toCalcData - The data to save (includes type, size, material, etc.)
   * @param {Object|null} editingOrderUnit - The order unit being edited (null for new)
   * @param {Function|null} setError - Optional setter for error state
   * @returns {Promise<void>}
   */
  const saveOrderUnit = useCallback(
    async (toCalcData, editingOrderUnit, setError) => {
      const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);

      const dataToSend = {
        orderId: thisOrder?.id,
        ...(isEdit && (editingOrderUnit?.id || editingOrderUnit?.idKey)
          ? { orderUnitId: editingOrderUnit.id || editingOrderUnit.idKey }
          : {}),
        toCalc: toCalcData,
      };

      try {
        // editIdKey — лише в режимі «Редагувати»; «Копіювати» створює нову позицію
        const response = await axios.post(
          `/orderUnits/OneOrder/OneOrderUnitInOrder`,
          withEditTarget(dataToSend, editingOrderUnit)
        );

        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);

        // Clear editing state if setter provided
        if (setEditingOrderUnit) {
          setEditingOrderUnit(null);
        }

        // Call success callback (typically closes modal)
        if (onSuccess) {
          onSuccess();
        }

        // Clear error if setter provided
        if (setError) {
          setError(null);
        }
      } catch (error) {
        if (setError) {
          // бекенд пише текст помилки в data.error — без нього лишалось «status code 500»
          setError(error?.response?.data?.error || error?.response?.data?.message || error?.message || "Помилка збереження");
        }

        if (error?.response?.status === 403) {
          navigate("/login");
        }
      }
    },
    [thisOrder?.id, setThisOrder, setSelectedThings2, onSuccess, setEditingOrderUnit, navigate]
  );

  return { saveOrderUnit };
}

export default useOrderUnitSave;
