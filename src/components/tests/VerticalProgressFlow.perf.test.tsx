import React from 'react';
import { render } from '@testing-library/react';
import axios from 'axios';
import VerticalProgressFlow from '../VerticalProgressFlow';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const generateMockData = (flowCount: number, stepCount: number) => {
  return {
    flows: Array.from({ length: flowCount }, (_, i) => ({
      name: `Flow ${i + 1}`,
      steps: Array.from({ length: stepCount }, (_, j) => ({
        name: `Step ${j + 1}`,
        completed: Math.random() > 0.5,
        output: Math.random() > 0.5 ? `Output ${j + 1}` : undefined,
      })),
    })),
  };
};

describe('VerticalProgressFlow Performance', () => {
  it('renders quickly with a small number of flows', async () => {
    const mockData = generateMockData(1, 5);
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const start = performance.now();
    render(<VerticalProgressFlow />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Renders in less than 100ms
  });

  it('renders within acceptable time with a large number of flows', async () => {
    const mockData = generateMockData(10, 20);
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const start = performance.now();
    render(<VerticalProgressFlow />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500); // Renders in less than 500ms
  });

  it('updates quickly during rapid progress changes', async () => {
    const initialData = generateMockData(5, 10);
    const updatedData = generateMockData(5, 10);
    mockedAxios.get.mockResolvedValueOnce({ data: initialData });

    const { rerender } = render(<VerticalProgressFlow />);

    mockedAxios.get.mockResolvedValueOnce({ data: updatedData });

    const start = performance.now();
    rerender(<VerticalProgressFlow />);
    const end = performance.now();

    expect(end - start).toBeLessThan(50); // Updates in less than 50ms
  });
});
