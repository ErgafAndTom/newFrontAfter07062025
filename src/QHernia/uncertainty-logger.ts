// uncertainty-logger.ts
interface UncertaintyMetric {
  position: string;  // де баг (файл, рядок)
  momentum: number;  // швидкість зміни стану
  uncertainty: number; // добуток невизначеностей
}

class HeisenbergLogger {
  private static PLANK_CONSTANT = 0.1; // умовна "константа Планка" для коду

  // Не можемо точно виміряти ОБА параметри одночасно
  log(event: any) {
    const positionPrecision = this.measurePosition(event);
    const momentumPrecision = this.measureMomentum(event);

    // Принцип невизначеності Гейзенберга: Δx * Δp >= ℏ/2
    const uncertainty = positionPrecision * momentumPrecision;

    if (uncertainty < HeisenbergLogger.PLANK_CONSTANT) {
      // Порушення принципу! Одна з вимірок некоректна
      console.warn('Observer effect detected! Reducing precision...');

      // Жертвуємо точністю позиції на користь momentum
      return this.logWithReducedPrecision(event);
    }

    return {
      position: this.getPosition(event, positionPrecision),
      momentum: this.getMomentum(event, momentumPrecision),
      uncertainty
    };
  }

  private measurePosition(event: any): number {
    // Точність залежить від глибини stack trace
    return event.stackDepth || 1;
  }

  private measureMomentum(event: any): number {
    // "Імпульс" = швидкість зміни стану за час
    return event.timeDelta || 1;
  }
}
