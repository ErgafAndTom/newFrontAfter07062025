/**
 * Утилітарний файл для управління замовленнями
 */
import axios from "../api/axiosInstance";

// Функція для програмного створення нового замовлення
export const createNewOrder = async () => {
  try {
    const response = await axios.post('/orders/create');
    return response.data;
  } catch (error) {
    console.error('Помилка при створенні замовлення:', error);
    throw error;
  }
};

// Функція для програмного натискання на кнопку "Нове замовлення"
export const clickNewOrderButton = () => {
  // Знаходимо кнопку "Нове замовлення" за різними селекторами
  const newOrderButtons = [
    document.getElementById('new-order-button'),
    document.querySelector('.newOrderButton'),
    document.querySelector('[data-testid="new-order-button"]'),
    document.querySelector('.adminButtonAdd'),
    ...Array.from(document.querySelectorAll('.adminButtonAdd')),
    ...Array.from(document.querySelectorAll('div')).filter(el => 
      el.textContent.trim() === 'Нове замовлення')
  ];

  // Знаходимо першу дійсну кнопку
  const button = newOrderButtons.find(btn => btn !== null);

  if (button) {
    // Програмно натискаємо на кнопку
    button.click();
    return true;
  }

  return false;
};
