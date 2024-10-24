import { v4 as uuidv4 } from 'uuid';

export interface TemplatePrompt {
  id: string;
  text: string;
  type: 'initial' | 'followup' | 'summary';
  order: number;
}

export interface ValidationRules {
  required: string[];
  patterns?: { [key: string]: string };
  dependencies?: { [key: string]: string[] };
  limits?: { [key: string]: { min?: number; max?: number } };
}

export interface AnalysisParameters {
  industry?: string;
  timeframe?: string;
  scope?: string;
  dataPoints?: string[];
  customParameters?: { [key: string]: any };
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters: AnalysisParameters;
  prompts: TemplatePrompt[];
  validation: ValidationRules;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

class TemplateService {
  private templates: Map<string, AnalysisTemplate> = new Map();

  // Create a new template
  async createTemplate(template: Omit<AnalysisTemplate, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<AnalysisTemplate> {
    const newTemplate: AnalysisTemplate = {
      ...template,
      id: uuidv4(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  // Get template by ID
  async getTemplate(id: string): Promise<AnalysisTemplate | null> {
    return this.templates.get(id) || null;
  }

  // Update existing template
  async updateTemplate(id: string, updates: Partial<AnalysisTemplate>): Promise<AnalysisTemplate | null> {
    const existing = this.templates.get(id);
    if (!existing) return null;

    const updated: AnalysisTemplate = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date()
    };

    this.templates.set(id, updated);
    return updated;
  }

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // List all templates
  async listTemplates(): Promise<AnalysisTemplate[]> {
    return Array.from(this.templates.values());
  }

  // Validate template
  validateTemplate(template: AnalysisTemplate): boolean {
    // Basic validation
    if (!template.name || !template.category) {
      return false;
    }

    // Validate prompts
    if (!Array.isArray(template.prompts) || template.prompts.length === 0) {
      return false;
    }

    // Validate parameters
    if (!template.parameters) {
      return false;
    }

    // Validate validation rules
    if (!template.validation || !Array.isArray(template.validation.required)) {
      return false;
    }

    return true;
  }

  // Clone template
  async cloneTemplate(id: string): Promise<AnalysisTemplate | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    return this.createTemplate({
      ...template,
      name: `${template.name} (Copy)`,
    });
  }
}

export const templateService = new TemplateService();
