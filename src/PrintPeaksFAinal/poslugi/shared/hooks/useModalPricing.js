import { useState, useEffect, useRef } from "react";
import axios from "../../../../api/axiosInstance";

/**
 * Hook for fetching pricing from /calc/pricing API with debounce
 * @param {string} type - Service type (e.g., "Laminator", "SheetCutBW")
 * @param {Object} calcData - Data to send for calculation
 * @param {boolean} enabled - Whether to fetch pricing (usually: modal is visible)
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {Object|null} editingOrderUnit - Existing OrderUnit (edit mode) — збережені ціни
 * @returns {{ pricesThis: Object|null, error: Error|null, loading: boolean }}
 */
export function useModalPricing(type, calcData, enabled = true, debounceMs = 300, editingOrderUnit = null) {
  const [pricesThis, setPricesThis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  const skipInitialPricing = useRef(false);

  // При відкритті в edit-mode — пропустити перший pricing виклик
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  useEffect(() => {
    if (enabled && isEdit) {
      skipInitialPricing.current = true;
    }
  }, [enabled, isEdit]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // В edit-mode пропускаємо перший виклик — показуємо збережені ціни
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        setPricesThis({ price: storedPrice, priceForOneThis: storedPerUnit });
      }
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced API call
    timeoutRef.current = setTimeout(() => {
      const dataToSend = {
        type,
        ...calcData,
      };

      setLoading(true);
      axios
        .post(`/calc/pricing`, dataToSend)
        .then((response) => {
          setPricesThis(response.data.prices);
          setError(null);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [type, JSON.stringify(calcData), enabled, debounceMs]);

  return { pricesThis, error, loading };
}

export default useModalPricing;
