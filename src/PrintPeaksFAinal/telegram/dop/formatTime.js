// ============================================================================
// formatTime.js
// ============================================================================

export function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${hh}:${mm}`;
}

export function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString();
}
