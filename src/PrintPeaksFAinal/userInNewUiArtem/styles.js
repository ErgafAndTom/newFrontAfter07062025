/**
 * Спільні стилі для компонентів у PrintPeaksFAinal/userInNewUiArtem
 */

// Базові стилі для кнопок
export const buttonStyles = {
  // Базовий стиль для всіх кнопок
  base: {
    padding: '0.5vh',
    borderRadius: '1vw',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inter, sans-serif',
    fontSize: '0.7vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0E7',
  },
  
  // Стиль для маленьких іконкових кнопок
  iconButton: {
    width: '2.5vw',
    height: '2.5vh',
    backgroundColor: '#F2F0E7',
  },
  
  // Стиль для стандартних кнопок дій
  actionButton: {
    padding: '0.8vh',
    width: '11vw',
    height: '3vh',
  },
  
  // Стилі для різних типів кнопок
  primary: {
    backgroundColor: '#3C60A6',
    color: 'white',
  },
  
  secondary: {
    backgroundColor: '#F2F0E7',
    color: '#707070',
  },
  
  success: {
    backgroundColor: '#008249',
    color: 'white',
  },
  
  warning: {
    backgroundColor: '#FFC107',
    color: 'black',
  },
  
  danger: {
    backgroundColor: '#ee3c23',
    color: 'white',
  },
  
  // Стиль для кнопки "Взяти в роботу"
  takeWork: {
    backgroundColor: '#FFC107',
    color: 'black',
    width: '11vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Постпрес"
  postpress: {
    backgroundColor: '#8B4513',
    color: 'white',
    width: '11vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Виконане"
  done: {
    backgroundColor: '#3C60A6',
    color: 'white',
    width: '11vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Віддати"
  handover: {
    backgroundColor: '#F075AA',
    color: 'white',
    width: '11vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Оплатити"
  pay: {
    backgroundColor: '#008249',
    color: 'white',
    width: '11vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Скасувати"
  cancel: {
    backgroundColor: 'transparent',
    color: '#ee3c23',
    position: 'absolute',
    top: '0vh',
    right: '-0.1vw',
    cursor: 'pointer',
    transform: 'scale(0.5)',
    border: 'none',
  },
  
  // Стиль для кнопки "Закрити"
  close: {
    backgroundColor: '#F2F0E7',
    color: '#707070',
    width: '8vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Видалити вибір"
  delete: {
    backgroundColor: '#ee3c23',
    color: 'white',
    width: '8vw',
    height: '3vh',
  },
  
  // Стиль для кнопки "Створити нового клієнта"
  createNew: {
    backgroundColor: '#FFC107',
    color: 'black',
    width: '15vw',
    height: '3vh',
    margin: '0 auto',
  },
  
  // Стиль для кнопки з іконкою
  withIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Стиль для іконки в кнопці
  icon: {
    marginRight: '0.5vw',
  },
  
  // Стиль для неактивної кнопки
  disabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};

// Стилі для контейнерів
export const containerStyles = {
  // Базовий стиль для контейнерів
  base: {
    padding: '1vh',
    borderRadius: '1vw',
    backgroundColor: '#F2F0E7',
  },
  
  // Стиль для модальних вікон
  modal: {
    backgroundColor: '#FBFAF6',
    borderRadius: '1vw',
    padding: '2vh',
  },
  
  // Стиль для заголовків
  header: {
    fontSize: '1.5vw',
    fontWeight: 'bold',
    marginBottom: '2vh',
  },
  
  // Стиль для підзаголовків
  subheader: {
    fontSize: '1vw',
    fontWeight: 'bold',
    marginBottom: '1vh',
  },
};

// Стилі для форм
export const formStyles = {
  // Базовий стиль для полів вводу
  input: {
    padding: '0.5vh',
    borderRadius: '0.4vw',
    border: '0.1vw solid #ccc',
    fontSize: '0.7vw',
    width: '100%',
  },
  
  // Стиль для міток
  label: {
    fontSize: '0.8vw',
    marginBottom: '0.5vh',
  },
  
  // Стиль для групи полів
  group: {
    marginBottom: '1.5vh',
  },
};
