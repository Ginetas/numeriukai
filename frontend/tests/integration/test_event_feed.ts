import { render } from '@testing-library/react';
import PlateEventCard from '../../components/plate-event/PlateEventCard';

it('shows plate event info', () => {
  const { getByText } = render(
    <PlateEventCard
      event={{ plate_text: 'ABC123', bbox: { x: 0, y: 0, w: 10, h: 10 }, timestamp: new Date().toISOString() }}
    />
  );
  expect(getByText(/ABC123/)).toBeTruthy();
});
