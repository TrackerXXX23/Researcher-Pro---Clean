import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { AnalysisWithRelations, ProcessResultWithRelations, User, Report, Template } from './models';
import { AnalysisFormData } from './analysis';

// Common Props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Analysis Components
export interface AnalysisBuilderProps extends BaseProps {
  onSubmit: (data: AnalysisFormData) => Promise<void>;
  isLoading?: boolean;
  defaultTemplate?: Template;
  onCancel?: () => void;
  error?: string;
}

export interface AnalysisProcessProps extends BaseProps {
  analysis: AnalysisWithRelations;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  showControls?: boolean;
}

export interface LiveUpdatesProps extends BaseProps {
  analysisId: number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface GeneratedReportsProps extends BaseProps {
  reports: Report[];
  onDownload?: (reportId: number) => void;
  onDelete?: (reportId: number) => void;
  isLoading?: boolean;
}

export interface ReportHistoryProps extends BaseProps {
  reports: ProcessResultWithRelations[];
  onReportClick?: (report: ProcessResultWithRelations) => void;
  onDelete?: (reportId: number) => void;
  isLoading?: boolean;
}

// Dashboard Components
export interface DashboardProps extends BaseProps {
  user: User;
  recentAnalyses?: AnalysisWithRelations[];
  recentReports?: Report[];
  templates?: Template[];
}

export interface StartNewAnalysisProps extends BaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: AnalysisFormData) => Promise<void>;
  templates?: Template[];
  defaultTemplate?: Template;
}

export interface AnalysisTemplatesProps extends BaseProps {
  templates: Template[];
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (templateId: number) => void;
  isLoading?: boolean;
}

// Auth Components
export interface AuthFormProps extends BaseProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
}

// UI Components
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  isRequired?: boolean;
}

export interface SelectProps extends BaseProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export interface CheckboxProps extends BaseProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  error?: string;
  isDisabled?: boolean;
}

export interface CardProps extends BaseProps {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  onClick?: () => void;
  isHoverable?: boolean;
}

export interface ToastProps extends BaseProps {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
}

export interface ProgressProps extends BaseProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

// Layout Components
export interface LayoutProps extends BaseProps {
  user?: User;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface SidebarProps extends BaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: User;
}

export interface NavbarProps extends BaseProps {
  user?: User;
  onLogout?: () => void;
}

// Utility Components
export interface ErrorBoundaryProps extends BaseProps {
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export interface LoadingSpinnerProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  thickness?: number;
}

export interface EmptyStateProps extends BaseProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}
