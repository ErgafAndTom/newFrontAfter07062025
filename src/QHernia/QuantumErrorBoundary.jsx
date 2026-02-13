// QuantumErrorBoundary.tsx - Основний компонент Error Boundary

import React, { Component, ErrorInfo } from 'react';
import { generateBugSignature } from '../../utils/bugSignature';
import { ErrorFallback } from './ErrorFallback';
import {
  QuantumErrorBoundaryProps,
  QuantumErrorBoundaryState
} from './types';

export class QuantumErrorBoundary extends Component<
  QuantumErrorBoundaryProps,
  QuantumErrorBoundaryState
> {
  constructor(props: QuantumErrorBoundaryProps) {
    super(props);
    this.state = {
      bugWavefunction: new Map(),
      collapsedBugs: [],
      lastError: null
    };
  }

  // Статичний метод для оновлення стану при помилці
  static getDerivedStateFromError(error) {
    return { lastError: error };
  }

  // Обробка помилки
  componentDidCatch(error, info) {
    const signature = generateBugSignature(error, info);
    const threshold = this.props.collapseThreshold || 3;

    this.setState(prev => {
      // Клонуємо Map (бо React потребує immutability)
      const newWavefunction = new Map(prev.bugWavefunction);
      const currentCount = newWavefunction.get(signature) || 0;
      const newCount = currentCount + 1;

      newWavefunction.set(signature, newCount);

      // Перевіряємо, чи баг "колапсував"
      if (newCount >= threshold && !prev.collapsedBugs.includes(signature)) {
        // Викликаємо callback, якщо він є
        this.props.onBugCollapse?.(signature, newCount);

        // Логування в консоль
        console.error('🔴 Квантовий баг колапсував:', {
          signature,
          count: newCount,
          error,
          componentStack: info.componentStack
        });

        return {
          bugWavefunction: newWavefunction,
          collapsedBugs: [...prev.collapsedBugs, signature],
          lastError: error
        };
      }

      // Якщо не досягли threshold, просто оновлюємо хвильову функцію
      console.warn(`⚠️ Плаваючий баг спостережено (${newCount}/${threshold}):`, signature);

      return {
        bugWavefunction: newWavefunction,
        lastError: error
      };
    });
  }

  // Метод для скидання помилки (reset)
  resetErrorBoundary = () => {
    this.setState({
      bugWavefunction: new Map(),
      collapsedBugs: [],
      lastError: null
    });
  };

  render() {
    const { collapsedBugs, lastError, bugWavefunction } = this.state;
    const { children, fallbackComponent: FallbackComponent } = this.props;

    // Якщо баг колапсував — показуємо fallback UI
    if (collapsedBugs.length > 0 && lastError) {
      const latestSignature = collapsedBugs[collapsedBugs.length - 1];
      const observationCount = bugWavefunction.get(latestSignature) || 0;

      // Використовуємо кастомний fallback або дефолтний
      const Fallback = FallbackComponent || ErrorFallback;

      return (
        <Fallback
          error={lastError}
          signature={latestSignature}
          observationCount={observationCount}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    // Якщо все ок — рендеримо дітей
    return children;
  }
}
