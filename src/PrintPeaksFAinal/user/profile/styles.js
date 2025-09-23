/**
 * Спільні стилі для компонентів у PrintPeaksFAinal/user/profile
 * Розширює стилі з PrintPeaksFAinal/userInNewUiArtem/styles.js
 */

import { buttonStyles as baseButtonStyles, containerStyles as baseContainerStyles, formStyles as baseFormStyles } from '../../userInNewUiArtem/styles';

// Розширені стилі для кнопок
export const buttonStyles = {
  ...baseButtonStyles,

  // Стиль для кнопок у профілі користувача
  profileButton: {
    ...baseButtonStyles.base,
    ...baseButtonStyles.actionButton,
    backgroundColor: '#F2F0E7',
    color: '#333',
    margin: '5px',
    width: '12vw',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e9e7e0',
    }
  },

  // Стиль для кнопки "Мої файли"
  filesButton: {
    ...baseButtonStyles.base,
    ...baseButtonStyles.primary,
    margin: '5px',
    width: '12vw',
  },

  // Стиль для кнопки "Мої замовлення"
  ordersButton: {
    ...baseButtonStyles.base,
    ...baseButtonStyles.warning,
    margin: '5px',
    width: '12vw',
  },

  // Стиль для кнопки "Мої способи оплати"
  paymentsButton: {
    ...baseButtonStyles.base,
    ...baseButtonStyles.success,
    margin: '5px',
    width: '12vw',
  },

  // Стиль для кнопки "Вийти"
  logoutButton: {
    ...baseButtonStyles.base,
    ...baseButtonStyles.danger,
    margin: '5px',
    width: '12vw',
  },
};

// Розширені стилі для контейнерів
export const containerStyles = {
  ...baseContainerStyles,

  // Стиль для контейнера профілю
  profileContainer: {
    ...baseContainerStyles.base,
    padding: '2vw',
    maxWidth: '98vw',
    margin: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },

  // Стиль для контейнера вкладок
  tabsContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
  },

  // Стиль для контейнера контенту профілю
  contentContainer: {
    padding: '15px 0',
  },
};

// Розширені стилі для форм
export const formStyles = {
  ...baseFormStyles,

  // Стиль для полів вводу у профілі
  profileInput: {
    ...baseFormStyles.input,
    margin: '5px 0',
  },

  // Стиль для селектів у профілі
  profileSelect: {
    ...baseFormStyles.input,
    margin: '5px 0',
  },
};

// Стилі для аватара
export const avatarStyles = {
  profileAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '15px',
  },
};

// Стилі для вкладок
export const tabStyles = {
  tabButton: {
    padding: '10px 20px',
    backgroundColor: '#f2f0e7',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },

  activeTab: {
    backgroundColor: '#FFC107',
    color: 'black',
    fontWeight: 'bold',
  },
};
