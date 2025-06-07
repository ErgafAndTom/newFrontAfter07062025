import RefactoringAgent from '../agents/RefactoringAgent';
import fs from 'fs';
import path from 'path';

export const startRefactoring = async (projectPath) => {
    const agent = new RefactoringAgent();
    const components = [];

    // Функція для рекурсивного читання файлів
    const readComponents = (dir) => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                readComponents(fullPath);
            } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                components.push({
                    name: file,
                    path: fullPath,
                    content
                });
            }
        }
    };

    try {
        // Читаємо всі компоненти
        readComponents(projectPath);

        // Створюємо план рефакторингу
        const plan = await agent.createRefactoringPlan(components);
        console.log('План рефакторингу створено:', plan);

        // Виконуємо рефакторинг
        const results = await agent.executeRefactoring(plan);
        console.log('Результати рефакторингу:', results);

        return {
            success: true,
            plan,
            results
        };
    } catch (error) {
        console.error('Помилка під час рефакторингу:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const generateReport = (results) => {
    return {
        summary: {
            totalComponents: results.length,
            successfulRefactors: results.filter(r => r.status === 'success').length,
            failedRefactors: results.filter(r => r.status === 'error').length
        },
        details: results.map(result => ({
            component: result.component,
            status: result.status,
            changes: result.changes,
            error: result.error
        }))
    };
};

export const applyRefactoring = async (projectPath) => {
    const results = await startRefactoring(projectPath);
    if (results.success) {
        const report = generateReport(results.results);
        console.log('Звіт про рефакторинг:', report);
        return report;
    }
    throw new Error(`Помилка рефакторингу: ${results.error}`);
}; 