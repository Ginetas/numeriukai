import React, { useState } from 'react';
import { OCRModel } from '../../types/ocr-model';

const OCRModelForm: React.FC<{ onSubmit: (model: OCRModel) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('crnn');
  const [weight, setWeight] = useState(1);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ id: Date.now(), name, type, weight, enabled: true, priority: 0, params: {} });
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-1" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="border p-1">
        <option value="crnn">CRNN</option>
        <option value="transformer">Transformer</option>
        <option value="tesseract">Tesseract</option>
      </select>
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(parseFloat(e.target.value))}
        className="border p-1"
      />
      <button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">
        Add
      </button>
    </form>
  );
};

export default OCRModelForm;
