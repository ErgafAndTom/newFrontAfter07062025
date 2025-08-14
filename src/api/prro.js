import axios from '../api/axiosInstance';

// подгони пути под prroRoutes
export async function getPrroStatus() {
  const { data } = await axios.get('/api/prro/status'); // { ok, shiftOpen, cashier, shiftId, error? }
  return data;
}

export async function openPrroShift() {
  const { data } = await axios.post('/api/prro/shift/open');
  return data;
}

export async function closePrroShift() {
  const { data } = await axios.post('/api/prro/shift/close');
  return data;
}
