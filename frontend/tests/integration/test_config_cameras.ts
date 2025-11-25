import { render } from '@testing-library/react';
import CameraLivePage from '../../app/config/cameras/[id]/live/page';

describe('Camera live page', () => {
  it('renders live title', () => {
    const { getByText } = render(<CameraLivePage params={{ id: '1' }} /> as any);
    expect(getByText(/Camera 1 Live/)).toBeTruthy();
  });
});
