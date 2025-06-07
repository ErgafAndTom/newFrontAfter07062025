/**
 * Функція для перетворення числа в словесний запис українською мовою
 * @param {number} num - Число для перетворення
 * @returns {string} - Текстовий запис числа
 */
export const numberToWords = (num) => {
    const units = ['', 'один', 'два', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
    const units_female = ['', 'одна', 'дві', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
    const teens = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п\'ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев\'ятнадцять'];
    const tens = ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'];
    const hundreds = ['', 'сто', 'двісті', 'триста', 'чотириста', 'п\'ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев\'ятсот'];
    const thousands = ['', 'тисяча', 'тисячі', 'тисяч'];
    const millions = ['', 'мільйон', 'мільйони', 'мільйонів'];
    
    if (num === 0) return 'нуль';
    
    const toWords = (n, isFemale = false) => {
        let result = '';
        
        if (n >= 100) {
            result += hundreds[Math.floor(n / 100)] + ' ';
            n %= 100;
        }
        
        if (n >= 10 && n < 20) {
            result += teens[n - 10] + ' ';
            n = 0;
        } else if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        
        if (n > 0) {
            if (isFemale) {
                result += units_female[n] + ' ';
            } else {
                result += units[n] + ' ';
            }
        }
        
        return result.trim();
    };
    
    const chunks = [];
    let n = Math.floor(num);
    
    while (n > 0) {
        chunks.push(n % 1000);
        n = Math.floor(n / 1000);
    }
    
    if (chunks.length === 0) return 'нуль';
    
    let result = '';
    
    if (chunks.length > 2) {
        const millionsChunk = chunks[2];
        if (millionsChunk > 0) {
            result += toWords(millionsChunk) + ' ';
            const lastDigit = millionsChunk % 10;
            const lastTwoDigits = millionsChunk % 100;
            
            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                result += millions[3] + ' ';
            } else if (lastDigit === 1) {
                result += millions[1] + ' ';
            } else if (lastDigit >= 2 && lastDigit <= 4) {
                result += millions[2] + ' ';
            } else {
                result += millions[3] + ' ';
            }
        }
    }
    
    if (chunks.length > 1) {
        const thousandsChunk = chunks[1];
        if (thousandsChunk > 0) {
            result += toWords(thousandsChunk, true) + ' ';
            const lastDigit = thousandsChunk % 10;
            const lastTwoDigits = thousandsChunk % 100;
            
            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                result += thousands[3] + ' ';
            } else if (lastDigit === 1) {
                result += thousands[1] + ' ';
            } else if (lastDigit >= 2 && lastDigit <= 4) {
                result += thousands[2] + ' ';
            } else {
                result += thousands[3] + ' ';
            }
        }
    }
    
    if (chunks.length > 0) {
        const unitsChunk = chunks[0];
        if (unitsChunk > 0 || chunks.length === 1) {
            result += toWords(unitsChunk);
        }
    }
    
    return result.trim();
};

/**
 * Функція для отримання правильного відмінювання слова "гривня"
 * @param {number} num - Число
 * @returns {string} - Правильне відмінювання слова "гривня"
 */
const getHryvniaForm = (num) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'гривень';
    } else if (lastDigit === 1) {
        return 'гривня';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'гривні';
    } else {
        return 'гривень';
    }
};

/**
 * Функція для отримання правильного відмінювання слова "копійка"
 * @param {number} num - Число
 * @returns {string} - Правильне відмінювання слова "копійка"
 */
const getKopiykaForm = (num) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'копійок';
    } else if (lastDigit === 1) {
        return 'копійка';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'копійки';
    } else {
        return 'копійок';
    }
};

/**
 * Отримує суму прописом з копійками
 * @param {number} amount - Сума для конвертації
 * @returns {string} - Сума прописом з копійками
 */
export const amountToWords = (amount) => {
    const integerPart = Math.floor(amount);
    const fractionalPart = Math.round((amount % 1) * 100);
    
    const hryvniaForm = getHryvniaForm(integerPart);
    const kopiykaForm = getKopiykaForm(fractionalPart);
    
    return `${numberToWords(integerPart)} ${hryvniaForm} ${fractionalPart} ${kopiykaForm}`;
};

