const norm = (v) => {
  if (v == null) return 0;
  const s = String(v).trim();
  const n = parseFloat(s.endsWith('%') ? s.slice(0, -1) : s);
  return Number.isFinite(n) ? n : 0;
};

const getEffectiveDiscount = (order) => {
  if (!order) return 0;

  const server = norm(order?.effectiveDiscount ?? order?.discount ?? order?.prepayment);
  const client = norm(order?.client?.discount);
  const company = norm(order?.client?.Company?.discount ?? order?.client?.company?.discount);

  return Math.max(server, client, company);
};

export { norm, getEffectiveDiscount };
