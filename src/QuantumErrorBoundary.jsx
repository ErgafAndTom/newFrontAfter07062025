import React from 'react';

class QuantumErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
    this.eventBuffer = [];
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    this.passiveLog({error, errorInfo});
  }

  passiveLog(context) {
    const interference = this.calculateInterference();

    // Якщо втручання занадто велике, пропускаємо
    if (interference > 0.5) {
      return; // не колапсуємо стан
    }

    this.eventBuffer.push({
      timestamp: Date.now(),
      context: this.sanitizeContext(context),
      interference
    });
  }

  calculateInterference() {
    // Оцінка впливу на продуктивність (browser-compatible)
    const bufferSize = this.eventBuffer.length;
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;

    return Math.min(bufferSize / 1000 + memoryUsage / 1e9, 1);
  }

  sanitizeContext(context) {
    try {
      return JSON.parse(JSON.stringify(context));
    } catch {
      return String(context);
    }
  }

  extractPattern(context) {
    if (!context) return 'unknown';
    if (context.error) return context.error.name || 'Error';
    return typeof context;
  }

  analyzePassively() {
    const patterns = new Map();

    for (const event of this.eventBuffer) {
      const pattern = this.extractPattern(event.context);
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }

    return patterns;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h1>Щось пішло не так</h1>
          <details style={{whiteSpace: 'pre-wrap', textAlign: 'left', maxWidth: '600px', margin: '0 auto'}}>
            <summary>Деталі помилки</summary>
            {this.state.error && this.state.error.toString()}
            <br/>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QuantumErrorBoundary;
