// Файл перекладів для стовпців таблиці замовлень
export const translateColumnName = (columnName) => {
    const translations = {
        // Загальні поля
        id: "№ замовлення",
        createdAt: "Дата створення",
        updatedAt: "Дата завершення",
        
        // Поля замовлень
        barcode: "Штрих-код",
        status: "Поточний статус",
        userPhoto: "Фото",
        userName: "Клієнт",
        phoneNumber: "Номер телефона",
        telegram: "Telegram",
        price: "Вартість",
        payStatus: "Статус оплати",
        responsible: "Відповідальний",
        action: "Дії",
        expanded: "Розгорнути",
        
        // Інші поля, які можуть знадобитися
        priceForThis: "Вартість",
        amountCanPushToOneList: "Кількість на аркуші",
        amountListForOne: "Використано аркушів",
    };
    
    return translations[columnName] || columnName;
};
