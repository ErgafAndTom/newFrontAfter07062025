import axios from './axiosInstance';

/**
 * API для роботи з контрагентами
 */
const counterpartyApi = {
  /**
   * Отримати всіх контрагентів користувача
   * @param {number} userId - ID користувача
   * @param {Object} getData
   * @returns {Promise} - Promise з даними контрагентів
   */
  getCounterparties: (userId, getData) => {
    return axios.post(`/user/getMyPayments`, getData);
  },

  /**
   * Додати нового контрагента
   * @param {number} userId - ID користувача
   * @param {Object} counterpartyData - Дані контрагента
   * @returns {Promise} - Promise з даними створеного контрагента
   */
  addCounterparty: (userId, counterpartyData) => {
    return axios.post(`/user/counterparties/${userId}`, counterpartyData);
  },

  /**
   * Оновити контрагента
   * @param {number} userId - ID користувача
   * @param {number} counterpartyId - ID контрагента
   * @param {Object} counterpartyData - Дані контрагента
   * @returns {Promise} - Promise з даними оновленого контрагента
   */
  updateCounterparty: (userId, counterpartyId, counterpartyData) => {
    return axios.put(`/user/counterparties/${userId}/${counterpartyId}`, counterpartyData);
  },

  /**
   * Видалити контрагента
   * @param {number} userId - ID користувача
   * @param {number} counterpartyId - ID контрагента
   * @returns {Promise} - Promise з результатом видалення
   */
  deleteCounterparty: (userId, counterpartyId) => {
    return axios.delete(`/user/counterparties/${userId}/${counterpartyId}`);
  }
};

export default counterpartyApi;