import React from 'react';
import { OCRModel } from '../../types/ocr-model';

const OCRModelTable: React.FC<{ models: OCRModel[] }> = ({ models }) => {
  return (
    <table className="min-w-full border" data-testid="ocr-model-table">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Weight</th>
          <th className="p-2 text-left">Enabled</th>
        </tr>
      </thead>
      <tbody>
        {models.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2">{m.name}</td>
            <td className="p-2">{m.type}</td>
            <td className="p-2">{m.weight}</td>
            <td className="p-2">{m.enabled ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OCRModelTable;
