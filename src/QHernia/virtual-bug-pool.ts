// virtual-bug-pool.ts
class VirtualBugPool {
  private pool: Map<string, {
    energy: number;      // "енергія" бага (critical → info)
    lifetime: number;    // час існування в мс
    annihilation: boolean; // чи анігілював (був вирішений)
  }> = new Map();

  // Віртуальні баги народжуються з вакууму
  spawnVirtualBug(stackTrace: string) {
    const energy = this.calculateEnergy(stackTrace);
    const lifetime = this.calculateLifetime(energy);

    this.pool.set(stackTrace, {
      energy,
      lifetime,
      annihilation: false
    });

    // Планируємо анігіляцію (авто-видалення)
    setTimeout(() => this.tryAnnihilate(stackTrace), lifetime);
  }

  // Енергія обчислюється з частоти/контексту
  private calculateEnergy(stackTrace: string): number {
    // E = hν (енергія пропорційна частоті)
    const frequency = this.getObservationFrequency(stackTrace);
    return frequency * 1000; // умовний множник
  }

  // Час життя обернено пропорційний енергії (E*t ~ ℏ)
  private calculateLifetime(energy: number): number {
    const PLANK = 100; // умовна одиниця
    return PLANK / energy;
  }

  // Спроба анігіляції (чи баг став реальним?)
  private tryAnnihilate(stackTrace: string) {
    const bug = this.pool.get(stackTrace);
    if (!bug) return;

    // Якщо енергія низька, баг зникає (як віртуальна частинка)
    if (bug.energy < 100) {
      this.pool.delete(stackTrace);
      console.log(`Virtual bug annihilated: ${stackTrace}`);
    } else {
      // Інакше стає реальним (реєструємо в Jira/GitHub)
      this.promoteToRealBug(stackTrace);
    }
  }

  private promoteToRealBug(stackTrace: string) {
    // Баг "матеріалізувався" — створюємо issue
    console.log(`Bug became REAL: ${stackTrace}`);
  }
}
