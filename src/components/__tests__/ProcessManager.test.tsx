import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProcessManager } from '../ProcessManager';
import { processService } from '@/services/processService';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/services/processService');
jest.mock('@/hooks/use-toast');

describe('ProcessManager', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<ProcessManager />);
    
    expect(screen.getByText('Research Process')).toBeInTheDocument();
    expect(screen.getByText('Start Process')).toBeInTheDocument();
    expect(screen.getByText('Data Collection')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Report Generation')).toBeInTheDocument();
    expect(screen.getByText('Insights Generation')).toBeInTheDocument();
  });

  it('handles start process correctly', async () => {
    const mockProcessId = 'test-process-id';
    (processService.startProcess as jest.Mock).mockResolvedValue(mockProcessId);

    render(<ProcessManager />);
    
    const startButton = screen.getByText('Start Process');
    await act(async () => {
      fireEvent.click(startButton);
    });

    expect(processService.startProcess).toHaveBeenCalled();
    expect(screen.getByText('Stop Process')).toBeInTheDocument();
  });

  it('handles stop process correctly', async () => {
    const mockProcessId = 'test-process-id';
    (processService.startProcess as jest.Mock).mockResolvedValue(mockProcessId);

    render(<ProcessManager />);
    
    // Start the process first
    const startButton = screen.getByText('Start Process');
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Then stop it
    const stopButton = screen.getByText('Stop Process');
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(processService.stopProcess).toHaveBeenCalledWith(mockProcessId);
  });

  it('displays process updates correctly', () => {
    render(<ProcessManager />);
    
    // Simulate a process update
    const mockUpdate = {
      stepId: 'data-collection',
      status: 'running' as const,
      progress: 50,
      details: 'Collecting data...'
    };

    act(() => {
      const updateCallback = (processService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
      updateCallback(mockUpdate);
    });

    expect(screen.getByText('Collecting data...')).toBeInTheDocument();
  });

  it('handles errors correctly', async () => {
    const mockError = new Error('Test error');
    (processService.startProcess as jest.Mock).mockRejectedValue(mockError);

    render(<ProcessManager />);
    
    const startButton = screen.getByText('Start Process');
    await act(async () => {
      fireEvent.click(startButton);
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error Starting Process',
      description: 'Test error',
      variant: 'destructive'
    }));
  });
});
