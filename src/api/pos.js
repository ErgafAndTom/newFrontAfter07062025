import axios from '../api/axiosInstance';

export async function posSale({ orderId, amountKop }) {
  const { data } = await axios.post('/pos/sale', { orderId, amountKop });
  return data; // { ok, payment }
}

export async function posCancel({ paymentId }) {
  const { data } = await axios.post('/pos/cancel', { paymentId });
  return data;
}

export async function posRefund({ paymentId, amountKop }) {
  const { data } = await axios.post('/pos/refund', { paymentId, amountKop });
  return data;
}
