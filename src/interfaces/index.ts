export interface ProcessedData {
  id: string;
  title: string;
  date: string;
  status: string;
  type: string;
}

export interface AnalysisResult extends ProcessedData {
  insights: string[];
  summary: string;
  confidence: number;
  recommendations: string[];
  dataPoints: {
    key: string;
    value: string | number;
  }[];
  insightSummary: string;
  keySummary: string;
  riskAssessment: string;
  significantChanges: boolean;
}

export interface ReportHistoryProps {
  onReportClick: (reportId: string) => void;
}

export interface StartNewAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NewAnalysisButtonProps {
  onAnalysisGenerated: (idea: string) => void;
}
