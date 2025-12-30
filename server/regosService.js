import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const REGOS_API_URL = process.env.REGOS_API_URL || 'https://api.regos.uz/v1';
const REGOS_API_KEY = process.env.REGOS_API_KEY;

// Regos API bilan ishlash uchun service
export const regosService = {
  // Kunlik savdo ma'lumotlarini olish
  async getDailySales(date) {
    try {
      const response = await axios.post(
        `${REGOS_API_URL}/Report/Sales`,
        {
          date_from: date,
          date_to: date,
        },
        {
          headers: {
            'Authorization': `Bearer ${REGOS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Filial bo'yicha savdo ma'lumotlarini olish
  async getSalesByDepartment(departmentId, dateFrom, dateTo) {
    try {
      const response = await axios.post(
        `${REGOS_API_URL}/Report/Sales`,
        {
          department_ids: [departmentId],
          date_from: dateFrom,
          date_to: dateTo,
        },
        {
          headers: {
            'Authorization': `Bearer ${REGOS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Barcha filiallarni olish
  async getDepartments() {
    try {
      const response = await axios.post(
        `${REGOS_API_URL}/Department/Get`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${REGOS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
