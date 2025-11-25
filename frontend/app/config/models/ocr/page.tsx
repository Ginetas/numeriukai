import React, { useEffect, useState } from 'react';
import OCRModelTable from '../../../../components/ocr/OCRModelTable';
import EnsembleConfigForm from '../../../../components/ocr/EnsembleConfigForm';
import { OCRModel } from '../../../../types/ocr-model';

const OCRModelsPage = () => {
  const [models, setModels] = useState<OCRModel[]>([]);

  useEffect(() => {
    setModels([
      { id: 1, name: 'CRNN', type: 'crnn', weight: 1, enabled: true, priority: 1, params: {} },
    ]);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">OCR Models</h1>
      <OCRModelTable models={models} />
      <EnsembleConfigForm />
    </div>
  );
};

export default OCRModelsPage;
