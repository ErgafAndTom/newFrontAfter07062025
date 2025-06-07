class InterfaceAgent {
    constructor() {
        this.actions = {
            click: this.handleClick,
            type: this.handleType,
            wait: this.handleWait,
            check: this.handleCheck
        };
        this.currentStep = 0;
        this.steps = [];
    }

    async handleClick(element, options = {}) {
        const { selector, text, index } = options;
        let targetElement;

        if (selector) {
            targetElement = document.querySelector(selector);
        } else if (text) {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent.trim() === text
            );
            targetElement = elements[index || 0];
        }

        if (targetElement) {
            targetElement.click();
            return { success: true, message: `Натиснуто елемент: ${selector || text}` };
        }
        return { success: false, message: 'Елемент не знайдено' };
    }

    async handleType(text, options = {}) {
        const { selector, delay = 100 } = options;
        const element = document.querySelector(selector);
        
        if (element) {
            // Симуляція набору тексту
            for (let char of text) {
                element.value += char;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return { success: true, message: `Введено текст: ${text}` };
        }
        return { success: false, message: 'Поле вводу не знайдено' };
    }

    async handleWait(time) {
        await new Promise(resolve => setTimeout(resolve, time));
        return { success: true, message: `Очікування ${time}мс завершено` };
    }

    async handleCheck(condition, options = {}) {
        const { timeout = 5000, interval = 100 } = options;
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (condition()) {
                return { success: true, message: 'Умова виконана' };
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        return { success: false, message: 'Час очікування вичерпано' };
    }

    addStep(action, params) {
        this.steps.push({ action, params });
    }

    async executeStep(step) {
        const { action, params } = step;
        if (this.actions[action]) {
            return await this.actions[action](...params);
        }
        return { success: false, message: `Невідома дія: ${action}` };
    }

    async executeAll() {
        const results = [];
        for (const step of this.steps) {
            const result = await this.executeStep(step);
            results.push(result);
            if (!result.success) {
                break;
            }
        }
        return results;
    }

    createPrompt(description, steps) {
        return {
            description,
            steps: steps.map(step => ({
                action: step.action,
                params: step.params,
                expected: step.expected
            }))
        };
    }

    async executePrompt(prompt) {
        console.log(`Виконується дія: ${prompt.description}`);
        this.steps = prompt.steps;
        return await this.executeAll();
    }
}

export default InterfaceAgent; 