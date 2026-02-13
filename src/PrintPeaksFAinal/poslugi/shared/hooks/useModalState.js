import { useMemo } from "react";

/**
 * Parses optionsJson from editingOrderUnit
 * @param {Object|null} orderUnit - The order unit being edited
 * @returns {Object|null} Parsed options or null
 */
function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try {
    return JSON.parse(orderUnit.optionsJson);
  } catch {
    return null;
  }
}

/**
 * Hook for modal edit state detection and options parsing
 * @param {Object|null} editingOrderUnit - The order unit being edited (null for new)
 * @param {boolean} show - Whether the modal is visible
 * @returns {{ isEdit: boolean, options: Object|null }}
 */
export function useModalState(editingOrderUnit, show) {
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);

  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  return { isEdit, options };
}

export default useModalState;
