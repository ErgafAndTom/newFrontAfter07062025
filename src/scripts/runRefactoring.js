import { applyRefactoring } from '../utils/refactoring';
import path from 'path';

const projectPath = path.resolve(__dirname, '..');

// console.log('Початок рефакторингу проекту...');
// console.log('Шлях до проекту:', projectPath);

applyRefactoring(projectPath)
    .then(report => {
        // console.log('\nРефакторинг завершено успішно!');
        // console.log('\nЗагальна статистика:');
        // console.log(`- Всього компонентів: ${report.summary.totalComponents}`);
        // console.log(`- Успішно оброблено: ${report.summary.successfulRefactors}`);
        // console.log(`- Помилки: ${report.summary.failedRefactors}`);
        //
        // console.log('\nДетальний звіт:');
        report.details.forEach(detail => {
            // console.log(`\nКомпонент: ${detail.component}`);
            // console.log(`Статус: ${detail.status}`);
            if (detail.changes.length > 0) {
                // console.log('Зміни:');
                detail.changes.forEach(change => {
                    // console.log(`- ${change.description}`);
                });
            }
            if (detail.error) {
                console.log(`Помилка: ${detail.error}`);
            }
        });
    })
    .catch(error => {
        console.error('Помилка під час рефакторингу:', error);
        process.exit(1);
    });
