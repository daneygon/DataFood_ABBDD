import axios from 'axios';

const API_URL = 'http://localhost:8080/api/employees';

export const employeeApi = {
    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    create: async (employeeData) => {
        const response = await axios.post(API_URL, employeeData);
        return response.data;
    },
    update: async (id, employeeData) => {
        const response = await axios.put(`${API_URL}/${id}`, employeeData);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await axios.patch(`${API_URL}/${id}/toggle-status`);
        return response.data;
    }
};