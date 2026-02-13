// types.ts - Типи для квантової системи відстеження багів

export interface BugSignature {
  name: string;
  message: string;
  componentStack: string;
  timestamp: number;
}

export interface QuantumErrorBoundaryState {
  bugWavefunction: Map<string, number>;
  collapsedBugs: string[];
  lastError: Error | null;
}

export interface QuantumErrorBoundaryProps {
  children: React.ReactNode;
  collapseThreshold?: number; // кількість спостережень для колапсу (default: 3)
  onBugCollapse?: (signature: string, count: number) => void; // callback при колапсі
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}

export interface ErrorFallbackProps {
  error: Error;
  signature: string;
  observationCount: number;
  resetErrorBoundary: () => void;
}
