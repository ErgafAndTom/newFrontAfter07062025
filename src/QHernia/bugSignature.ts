// bugSignature.ts - Генерація "квантової сигнатури" бага

import { BugSignature } from '../components/errors/types';

export function generateBugSignature(
  error: Error,
  info: React.ErrorInfo
): string {
  // Створюємо унікальний хеш з помилки
  const stack = info.componentStack?.slice(0, 100) || 'unknown';
  return `${error.name}:${error.message}:${stack}`;
}

export function parseBugSignature(signature: string): BugSignature {
  const [name, message, componentStack] = signature.split(':');
  return {
    name: name || 'UnknownError',
    message: message || 'No message',
    componentStack: componentStack || 'unknown',
    timestamp: Date.now()
  };
}

// Хешування для зменшення розміру сигнатури (опціонально)
export function hashSignature(signature: string): string {
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    const char = signature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
