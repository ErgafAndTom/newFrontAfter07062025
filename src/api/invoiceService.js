import axios from '../../src/api/axiosInstance';

const API_URL = '/api/invoices';

export const invoiceService = {
    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    create: async (invoiceData) => {
        const response = await axios.post(API_URL, invoiceData);
        return response.data;
    },

    generateDocx: async (id) => {
        const response = await axios.post(`${API_URL}/${id}/generate`, {}, {
            responseType: 'blob'
        });
        return response.data;
    },

    addPayment: async (id, paymentData) => {
        const response = await axios.post(`${API_URL}/${id}/payment`, paymentData);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await axios.patch(`${API_URL}/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    }
}; 