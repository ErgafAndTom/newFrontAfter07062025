// ErrorFallback.tsx - Компонент відображення помилки

import React from 'react';
import { ErrorFallbackProps } from './types';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
                                                              error,
                                                              signature,
                                                              observationCount,
                                                              resetErrorBoundary
                                                            }) => {
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #ff4444',
      borderRadius: '8px',
      backgroundColor: '#fff5f5',
      margin: '20px'
    }}>
      <h2 style={{ color: '#cc0000' }}>
        🐛 Квантовий баг колапсував у реальність!
      </h2>

      <div style={{ marginTop: '15px' }}>
        <p><strong>Тип помилки:</strong> {error.name}</p>
        <p><strong>Повідомлення:</strong> {error.message}</p>
        <p><strong>Кількість спостережень:</strong> {observationCount}</p>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            Показати сигнатуру бага
          </summary>
          <pre style={{
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {signature}
          </pre>
        </details>
      </div>

      <button
        onClick={resetErrorBoundary}
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🔄 Спробувати знову
      </button>
    </div>
  );
};
