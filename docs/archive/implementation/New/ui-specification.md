# Researcher Pro: UI/UX Specification

## Dashboard Layout

### 1. Main Navigation
```typescript
interface NavigationItem {
  label: string;
  icon: IconType;
  route: string;
  badge?: {
    count: number;
    variant: 'default' | 'warning' | 'error';
  };
}

const mainNavigation: NavigationItem[] = [
  { label: 'Dashboard', icon: 'Home', route: '/' },
  { label: 'Analyses', icon: 'Analysis', route: '/analyses' },
  { label: 'Reports', icon: 'Report', route: '/reports' },
  { label: 'Templates', icon: 'Template', route: '/templates' },
];
```

### 2. New Analysis Section

#### Start Analysis Button
```typescript
interface NewAnalysisButton {
  variant: 'primary';
  size: 'large';
  icon: 'Plus';
  label: 'New Analysis';
  onClick: () => void;
}
```

#### Analysis Modal
```typescript
interface AnalysisModal {
  sections: {
    templates: AnalysisTemplate[];
    customBuilder: CustomAnalysisForm;
    recentAnalyses: RecentAnalysis[];
  };
  tabs: TabConfig[];
  actions: ModalAction[];
}

interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  presetFields: Record<string, any>;
  icon: string;
}
```

#### Custom Analysis Form
```typescript
interface CustomAnalysisForm {
  fields: {
    category: SelectField<Category>;
    clientSegment: AutocompleteField<ClientSegment>;
    jurisdiction: SelectField<Jurisdiction>;
    industry: SelectField<Industry>;
    strategy: SelectField<Strategy>;
    goals: MultiSelectField<Goal>;
    customPrompts: TextAreaField;
    dataSources: CheckboxGroup<DataSource>;
  };
  validation: FormValidation;
  layout: FormLayout;
}
```

### 3. Suggested Analyses Section

```typescript
interface SuggestedAnalysis {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  tags: string[];
  source: 'ai' | 'trending' | 'history';
  action: () => void;
}

interface SuggestionsPanel {
  suggestions: SuggestedAnalysis[];
  filters: SuggestionFilter[];
  sorting: SortOption[];
  refreshInterval: number;
}
```

### 4. Analysis Process Tracking

#### VerticalProgressFlow Component
```typescript
interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  substeps?: ProgressStep[];
  timestamp: Date;
}

interface ProgressFlow {
  steps: ProgressStep[];
  currentStep: number;
  orientation: 'vertical' | 'horizontal';
  expandedSteps: Set<string>;
  animations: AnimationConfig;
}
```

#### Live Updates Panel
```typescript
interface UpdateEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  details?: string;
  relatedStep?: string;
}

interface LiveUpdatesPanel {
  updates: UpdateEntry[];
  filters: UpdateFilter[];
  autoScroll: boolean;
  maxEntries: number;
}
```

### 5. Report Viewer

```typescript
interface ReportViewer {
  sections: ReportSection[];
  navigation: {
    sidebar: boolean;
    outline: boolean;
    breadcrumbs: boolean;
  };
  interactivity: {
    charts: boolean;
    tables: boolean;
    filters: boolean;
  };
  export: ExportOptions;
}

interface ReportSection {
  id: string;
  type: 'text' | 'chart' | 'table' | 'interactive';
  content: any;
  style: SectionStyle;
  actions: SectionAction[];
}
```

## Component Specifications

### 1. Analysis Templates Grid

```typescript
interface TemplateGrid {
  layout: 'grid' | 'list';
  columns: number;
  gap: number;
  items: TemplateCard[];
  filtering: FilterConfig;
  sorting: SortConfig;
}

interface TemplateCard {
  template: AnalysisTemplate;
  hover: HoverEffect;
  onClick: () => void;
  preview?: () => void;
}
```

### 2. Custom Analysis Builder

```typescript
interface BuilderLayout {
  sections: FormSection[];
  navigation: StepNavigation;
  validation: ValidationConfig;
  preview: PreviewConfig;
}

interface FormSection {
  title: string;
  fields: FormField[];
  conditional?: ConditionalDisplay;
  validation: SectionValidation;
}
```

### 3. Progress Visualization

```typescript
interface ProgressVisualization {
  type: 'linear' | 'circular' | 'steps';
  animation: {
    duration: number;
    easing: string;
    delay: number;
  };
  indicators: {
    success: IconConfig;
    error: IconConfig;
    running: IconConfig;
  };
}
```

## Interaction Patterns

### 1. Form Interactions

```typescript
interface FormInteraction {
  validation: {
    mode: 'onChange' | 'onBlur' | 'onSubmit';
    debounce: number;
    messages: ValidationMessages;
  };
  autosave: {
    enabled: boolean;
    interval: number;
    conditions: AutosaveCondition[];
  };
}
```

### 2. Real-time Updates

```typescript
interface UpdateHandler {
  throttle: number;
  batchSize: number;
  priority: 'speed' | 'accuracy';
  errorHandling: ErrorConfig;
}
```

### 3. Navigation Flow

```typescript
interface NavigationFlow {
  breadcrumbs: boolean;
  backButton: boolean;
  shortcuts: ShortcutConfig[];
  transitions: TransitionConfig;
}
```

## Responsive Design

```typescript
interface ResponsiveConfig {
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  layouts: Record<string, LayoutConfig>;
  adaptiveUI: AdaptiveConfig;
}
```

## Theme Configuration

```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
```

## Accessibility

```typescript
interface AccessibilityConfig {
  aria: AriaConfig;
  keyboard: KeyboardConfig;
  contrast: ContrastConfig;
  animations: AnimationPreferences;
}
```

## Implementation Guidelines

1. **Component Development**
   - Use Atomic Design principles
   - Implement proper loading states
   - Handle error states gracefully
   - Include proper accessibility attributes

2. **State Management**
   - Use React Query for server state
   - Implement proper caching
   - Handle optimistic updates
   - Manage form state efficiently

3. **Performance**
   - Implement code splitting
   - Use proper memoization
   - Optimize re-renders
   - Implement virtual scrolling for long lists

4. **Testing**
   - Write component tests
   - Implement E2E tests
   - Test accessibility
   - Test responsive behavior

5. **Documentation**
   - Document props and types
   - Include usage examples
   - Document accessibility features
   - Include responsive behavior notes
