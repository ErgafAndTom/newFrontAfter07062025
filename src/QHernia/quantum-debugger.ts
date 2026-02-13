// quantum-debugger.ts
interface BugQuantumState {
  id: string;
  wavefunction: Map<string, number>; // стани і ймовірності
  collapsed: boolean;
  observationAttempts: number;
  reproductionProbability: number;
}

class QuantumBugTracker {
  private bugs: Map<string, BugQuantumState> = new Map();

  // Пасивне спостереження (не колапсує стан)
  passiveObserve(bugId: string, context: any) {
    const bug = this.bugs.get(bugId);
    if (!bug) return;

    // Збираємо контекст БЕЗ активного втручання
    bug.wavefunction.set(JSON.stringify(context),
      (bug.wavefunction.get(JSON.stringify(context)) || 0) + 1
    );

    // Оновлюємо ймовірність БЕЗ колапсу
    bug.reproductionProbability = this.calculateProbability(bug);
  }

  // Активне вимірювання (намагається колапсувати)
  activeObserve(bugId: string): boolean {
    const bug = this.bugs.get(bugId);
    if (!bug) return false;

    bug.observationAttempts++;

    // Парадокс: чим більше спроб, тим менша ймовірність успіху
    const heisenbergFactor = Math.exp(-bug.observationAttempts * 0.1);
    const success = Math.random() < bug.reproductionProbability * heisenbergFactor;

    if (success) {
      bug.collapsed = true;
      this.generateStackTrace(bug);
    }

    return success;
  }

  private calculateProbability(bug: BugQuantumState): number {
    // Ймовірність базується на частоті спостережень у різних контекстах
    const totalObservations = Array.from(bug.wavefunction.values())
      .reduce((sum, count) => sum + count, 0);

    // Чим більше різних контекстів, тим вища ймовірність
    const contextDiversity = bug.wavefunction.size;

    return Math.min(contextDiversity / totalObservations, 1);
  }

  // Квантове тунелювання: форсуємо колапс через статистику
  forceTunnel(bugId: string): string[] {
    const bug = this.bugs.get(bugId);
    if (!bug) return [];

    // Шукаємо найймовірніший контекст
    const sortedContexts = Array.from(bug.wavefunction.entries())
      .sort((a, b) => b[1] - a[1]);

    return sortedContexts.slice(0, 3).map(([ctx]) => ctx);
  }
}
