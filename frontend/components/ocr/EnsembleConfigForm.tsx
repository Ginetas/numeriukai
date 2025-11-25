import React, { useState } from 'react';

const EnsembleConfigForm: React.FC = () => {
  const [method, setMethod] = useState('majority');
  const [beamWidth, setBeamWidth] = useState(2);

  return (
    <div className="border rounded p-4 space-y-2" data-testid="ensemble-config-form">
      <h3 className="text-lg font-semibold">Ensemble Config</h3>
      <label className="block text-sm">Method</label>
      <select value={method} onChange={(e) => setMethod(e.target.value)} className="border p-1">
        <option value="majority">Majority</option>
        <option value="weighted">Weighted</option>
        <option value="beam-search">Beam Search</option>
      </select>
      {method === 'beam-search' && (
        <input
          type="number"
          className="border p-1"
          value={beamWidth}
          onChange={(e) => setBeamWidth(parseInt(e.target.value))}
        />
      )}
    </div>
  );
};

export default EnsembleConfigForm;
