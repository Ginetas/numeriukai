import { render } from '@testing-library/react';
import LiveVideoPlayer from '../../components/live/LiveVideoPlayer';

it('renders live video player', () => {
  const { getByText } = render(<LiveVideoPlayer cameraId="1" backendUrl="http://localhost" />);
  expect(getByText('Pause') || getByText('Play')).toBeTruthy();
});
