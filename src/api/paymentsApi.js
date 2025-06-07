import axios from './axiosInstance';

/**
 * API для роботи з платежами
 */
const paymentsApi = {
  /**
   * Отримати всі платежі для замовлення
   * @param {number} orderId - ID замовлення
   * @returns {Promise} - Promise з даними платежів
   */
  getPayments: (orderId) => {
    return axios.get(`/orders/payments/${orderId}`);
  },

  /**
   * Отримати інформацію про замовлення
   * @param {number} orderId - ID замовлення
   * @returns {Promise} - Promise з даними замовлення
   */
  getOrderInfo: (orderId) => {
    return axios.get(`/orders/OneOrder/${orderId}`);
  },

  /**
   * Додати новий платіж
   * @param {Object} paymentData - Дані платежу
   * @param {number} paymentData.orderId - ID замовлення
   * @param {string} paymentData.method - Метод оплати
   * @param {number} paymentData.amount - Сума платежу
   * @param {string} paymentData.comment - Коментар до платежу
   * @returns {Promise} - Promise з даними створеного платежу
   */
  addPayment: (paymentData) => {
    return axios.post('/orders/payment', paymentData);
  },

  /**
   * Видалити платіж
   * @param {number} paymentId - ID платежу
   * @returns {Promise} - Promise з результатом видалення
   */
  deletePayment: (paymentId) => {
    return axios.delete(`/orders/payment/${paymentId}`);
  }
};

export default paymentsApi;