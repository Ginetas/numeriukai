import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { status: 'ok' }, isLoading: false, refetch: jest.fn() }),
}));

jest.mock('@/hooks/use-events-stream', () => ({ useEventsStream: jest.fn() }));
jest.mock('@/store/events', () => ({ useEventsStore: () => ({ events: [], setEvents: jest.fn() }) }));

jest.mock('@/hooks/use-api', () => ({
  useApiQuery: () => ({ data: [], isLoading: false, refetch: jest.fn() }),
}));

jest.mock('@/hooks/use-health', () => ({ useHealthStatus: () => ({ data: { status: 'ok' }, isLoading: false }) }));

jest.mock('@/components/ui/toast', () => ({ useToast: () => ({ push: jest.fn() }) }));

describe('DashboardPage', () => {
  it('renders dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Plate event feed/i)).toBeInTheDocument();
  });
});
