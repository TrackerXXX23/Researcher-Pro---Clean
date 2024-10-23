import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import VerticalProgressFlow from '../VerticalProgressFlow';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VerticalProgressFlow Integration', () => {
  it('fetches data from API and updates state', async () => {
    const mockData = {
      flows: [
        {
          name: 'Flow 1',
          steps: [
            { name: 'Step 1', completed: true, output: 'Output 1' },
            { name: 'Step 2', completed: false },
          ],
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: mockData });

    await act(async () => {
      render(<VerticalProgressFlow />);
    });

    await waitFor(() => {
      expect(screen.getByText('Flow 1')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Output 1')).toBeInTheDocument();
    });
  });

  it('updates progress at intervals', async () => {
    const initialData = {
      flows: [
        {
          name: 'Flow 1',
          steps: [
            { name: 'Step 1', completed: true, output: 'Output 1' },
            { name: 'Step 2', completed: false },
          ],
        },
      ],
    };

    const updatedData = {
      flows: [
        {
          name: 'Flow 1',
          steps: [
            { name: 'Step 1', completed: true, output: 'Output 1' },
            { name: 'Step 2', completed: true, output: 'Output 2' },
          ],
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: initialData });

    jest.useFakeTimers();

    await act(async () => {
      render(<VerticalProgressFlow />);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 2')).not.toHaveClass('text-green-500');
    });

    mockedAxios.get.mockResolvedValueOnce({ data: updatedData });

    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
    });

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toHaveClass('text-green-500');
      expect(screen.getByText('Output 2')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
