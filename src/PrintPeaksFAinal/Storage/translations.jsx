// Переклади назв стовпців для таблиці матеріалів
export const columnTranslations = {
    id: "ID",
    name: "Назва",
    type: "Тип",
    typeUse: "Використання",
    cost: "Вартість",
    width: "Ширина",
    height: "Висота",
    weight: "Вага",
    thickness: "Товщина",
    manufacturer: "Виробник",
    count: "Кількість",
    color: "Колір",
    price1: "Ціна 1",
    price2: "Ціна 2",
    price3: "Ціна 3",
    price4: "Ціна 4",
    price5: "Ціна 5",
    createdAt: "Створено",
    updatedAt: "Оновлено"
};

// Функція для отримання перекладу колонки
export const translateColumnName = (columnName) => {
    return columnTranslations[columnName] || columnName;
};
