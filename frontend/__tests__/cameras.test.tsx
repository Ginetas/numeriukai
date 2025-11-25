import { render, screen } from '@testing-library/react';
import CamerasPage from '@/app/config/cameras/page';

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false }),
}));

jest.mock('@/hooks/use-api', () => ({
  useApiQuery: () => ({ data: [], isLoading: false }),
  useApiMutation: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@/components/ui/toast', () => ({ useToast: () => ({ push: jest.fn() }) }));

describe('CamerasPage', () => {
  it('renders cameras heading', () => {
    render(<CamerasPage />);
    expect(screen.getByText(/Cameras/i)).toBeInTheDocument();
  });
});
