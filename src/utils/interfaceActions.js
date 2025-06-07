import InterfaceAgent from '../agents/InterfaceAgent';

export const createInterfaceAction = (description, steps) => {
    const agent = new InterfaceAgent();
    return agent.createPrompt(description, steps);
};

export const executeInterfaceAction = async (prompt) => {
    const agent = new InterfaceAgent();
    return await agent.executePrompt(prompt);
};

// Приклади готових дій
export const commonActions = {
    clickButton: (text) => createInterfaceAction(
        `Натискання кнопки "${text}"`,
        [
            {
                action: 'click',
                params: [null, { text }],
                expected: 'Кнопка натиснута'
            }
        ]
    ),

    typeInField: (selector, text) => createInterfaceAction(
        `Введення тексту "${text}" в поле`,
        [
            {
                action: 'type',
                params: [text, { selector }],
                expected: 'Текст введено'
            }
        ]
    ),

    waitForElement: (selector, timeout = 5000) => createInterfaceAction(
        `Очікування появи елемента ${selector}`,
        [
            {
                action: 'check',
                params: [
                    () => document.querySelector(selector) !== null,
                    { timeout }
                ],
                expected: 'Елемент знайдено'
            }
        ]
    ),

    clickAndWait: (text, waitTime = 1000) => createInterfaceAction(
        `Натискання кнопки "${text}" та очікування`,
        [
            {
                action: 'click',
                params: [null, { text }],
                expected: 'Кнопка натиснута'
            },
            {
                action: 'wait',
                params: [waitTime],
                expected: 'Очікування завершено'
            }
        ]
    ),

    fillForm: (fields) => createInterfaceAction(
        'Заповнення форми',
        fields.map(field => ({
            action: 'type',
            params: [field.text, { selector: field.selector }],
            expected: `Поле ${field.selector} заповнено`
        }))
    )
};

// Приклад використання:
/*
const loginAction = createInterfaceAction(
    'Вхід в систему',
    [
        {
            action: 'type',
            params: ['username', { selector: '#username' }],
            expected: 'Логін введено'
        },
        {
            action: 'type',
            params: ['password', { selector: '#password' }],
            expected: 'Пароль введено'
        },
        {
            action: 'click',
            params: [null, { text: 'Увійти' }],
            expected: 'Кнопка входу натиснута'
        }
    ]
);

await executeInterfaceAction(loginAction);
*/ 