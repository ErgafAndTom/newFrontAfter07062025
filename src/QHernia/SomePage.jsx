// SomePage.tsx
import React from 'react';
import { QuantumErrorBoundary } from '../QHernia/QuantumErrorBoundary';
import AllWindow from '../components/AllWindow';

const SomePage = () => {
  return (
    <div>
      <h1>Моя сторінка</h1>

      {/* Тільки цей компонент захищений */}
      <QuantumErrorBoundary collapseThreshold={2}>
        <AllWindow/>
      </QuantumErrorBoundary>
    </div>
  );
};

export default SomePage;
