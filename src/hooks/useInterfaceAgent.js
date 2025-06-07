import { useState, useCallback } from 'react';
import { createInterfaceAction, executeInterfaceAction, commonActions } from '../utils/interfaceActions';

export const useInterfaceAgent = () => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [error, setError] = useState(null);

    const executeAction = useCallback(async (action) => {
        setIsExecuting(true);
        setError(null);
        try {
            const result = await executeInterfaceAction(action);
            setLastResult(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsExecuting(false);
        }
    }, []);

    const createAction = useCallback((description, steps) => {
        return createInterfaceAction(description, steps);
    }, []);

    return {
        isExecuting,
        lastResult,
        error,
        executeAction,
        createAction,
        commonActions
    };
};

// Приклад використання в компоненті:
/*
const MyComponent = () => {
    const { executeAction, commonActions } = useInterfaceAgent();

    const handleLogin = async () => {
        const loginAction = commonActions.fillForm([
            { selector: '#username', text: 'user123' },
            { selector: '#password', text: 'pass123' }
        ]);

        try {
            await executeAction(loginAction);
            await executeAction(commonActions.clickButton('Увійти'));
        } catch (error) {
            console.error('Помилка входу:', error);
        }
    };

    return (
        <button onClick={handleLogin}>
            Увійти
        </button>
    );
};
*/ 