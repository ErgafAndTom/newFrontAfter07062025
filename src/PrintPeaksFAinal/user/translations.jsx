// Переклади назв стовпців для таблиці користувачів
export const columnTranslations = {
    id: "ID",
    username: "Логін",
    firstName: "Ім'я",
    lastName: "Прізвище",
    familyName: "По-батькові",
    email: "Email",
    phoneNumber: "Телефон",
    password: "Пароль",
    role: "Роль",
    createdAt: "Створено",
    updatedAt: "Оновлено"
};

// Функція для отримання перекладу колонки
export const translateColumnName = (columnName) => {
    return columnTranslations[columnName] || columnName;
};
// Переклади назв стовпців для таблиці користувачів
// export const columnTranslations = {
//     id: "ID",
//     username: "Логін",
//     firstName: "Ім'я",
//     lastName: "Прізвище",
//     familyName: "По-батькові",
//     email: "Email",
//     phoneNumber: "Телефон",
//     password: "Пароль",
//     role: "Роль",
//     createdAt: "Створено",
//     updatedAt: "Оновлено"
// };
//
// // Функція для отримання перекладу колонки
// export const translateColumnName = (columnName) => {
//     return columnTranslations[columnName] || columnName;
// };