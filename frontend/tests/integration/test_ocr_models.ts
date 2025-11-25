import { render } from '@testing-library/react';
import OCRModelsPage from '../../app/config/models/ocr/page';

describe('OCR Models page', () => {
  it('shows table and ensemble form', () => {
    const { getByTestId } = render(<OCRModelsPage />);
    expect(getByTestId('ocr-model-table')).toBeTruthy();
    expect(getByTestId('ensemble-config-form')).toBeTruthy();
  });
});
