import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnalysisProcess } from '../AnalysisProcess'

describe('AnalysisProcess', () => {
  const mockStartAnalysis = jest.fn()
  const mockPauseAnalysis = jest.fn()
  const mockResumeAnalysis = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders analysis process component', () => {
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="in_progress"
        progress={50}
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    expect(screen.getByTestId('analysis-process')).toBeInTheDocument()
    expect(screen.getByText(/50%/i)).toBeInTheDocument()
  })

  it('handles start analysis', async () => {
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="idle"
        progress={0}
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    const startButton = screen.getByRole('button', { name: /start/i })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockStartAnalysis).toHaveBeenCalledWith('test-id')
    })
  })

  it('handles pause and resume', async () => {
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="in_progress"
        progress={30}
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    // Test pause
    const pauseButton = screen.getByRole('button', { name: /pause/i })
    fireEvent.click(pauseButton)
    await waitFor(() => {
      expect(mockPauseAnalysis).toHaveBeenCalledWith('test-id')
    })

    // Test resume
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="paused"
        progress={30}
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    const resumeButton = screen.getByRole('button', { name: /resume/i })
    fireEvent.click(resumeButton)
    await waitFor(() => {
      expect(mockResumeAnalysis).toHaveBeenCalledWith('test-id')
    })
  })

  it('displays error state', () => {
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="error"
        progress={30}
        error="Analysis failed"
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    expect(screen.getByText(/Analysis failed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('shows completion state', () => {
    render(
      <AnalysisProcess
        analysisId="test-id"
        status="completed"
        progress={100}
        onStart={mockStartAnalysis}
        onPause={mockPauseAnalysis}
        onResume={mockResumeAnalysis}
      />
    )

    expect(screen.getByText(/Analysis Complete/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
  })
})
