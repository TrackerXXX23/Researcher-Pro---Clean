import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import VerticalProgressFlow from '../VerticalProgressFlow';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockFlowData = {
  flows: [
    {
      name: 'Flow 1',
      steps: [
        { name: 'Step 1', status: 'completed', output: 'Output 1' },
        { name: 'Step 2', status: 'in-progress' },
        { name: 'Step 3', status: 'error' },
      ],
    },
  ],
};

describe('VerticalProgressFlow', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockFlowData });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      expect(screen.getByText('Development Progress')).toBeInTheDocument();
    });
  });

  it('displays flows and steps correctly', async () => {
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      expect(screen.getByText('Flow 1')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });
  });

  it('applies correct styles for different step statuses', async () => {
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      const completedStep = screen.getByText('1').closest('.rounded-full');
      const inProgressStep = screen.getByText('2').closest('.rounded-full');
      const errorStep = screen.getByText('3').closest('.rounded-full');
      expect(completedStep).toHaveClass('bg-green-500');
      expect(inProgressStep).toHaveClass('bg-yellow-500');
      expect(errorStep).toHaveClass('bg-red-500');
    });
  });

  it('displays output for completed steps', async () => {
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      expect(screen.getByText('Output:')).toBeInTheDocument();
      expect(screen.getByText('Output 1')).toBeInTheDocument();
    });
  });

  it('displays a message when no progress data is available', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { flows: [] } });
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      expect(screen.getByText('No progress data available.')).toBeInTheDocument();
      expect(screen.getByText('No progress data available.')).toHaveClass('text-gray-500');
    });
  });

  it('applies hover effect to step numbers', async () => {
    await act(async () => {
      render(<VerticalProgressFlow />);
    });
    await waitFor(() => {
      const stepNumber = screen.getByText('1').closest('.rounded-full');
      expect(stepNumber).toHaveClass('transition-all');
      expect(stepNumber).toHaveClass('duration-300');
      expect(stepNumber).toHaveClass('hover:scale-110');
    });
  });
});
