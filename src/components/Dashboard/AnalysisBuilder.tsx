'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { analysisService } from '@/services/analysisService';

interface FieldConfig {
  label: string;
  type: 'text' | 'checkbox' | 'number';
  required?: boolean;
}

interface AnalysisConfig {
  [key: string]: FieldConfig;
}

const defaultConfig: AnalysisConfig = {
  marketAnalysis: {
    label: 'Market Analysis',
    type: 'checkbox',
  },
  competitorAnalysis: {
    label: 'Competitor Analysis',
    type: 'checkbox',
  },
  trendAnalysis: {
    label: 'Trend Analysis',
    type: 'checkbox',
  },
  riskAssessment: {
    label: 'Risk Assessment',
    type: 'checkbox',
  },
  opportunityAnalysis: {
    label: 'Opportunity Analysis',
    type: 'checkbox',
  },
};

interface AnalysisParameters {
  [key: string]: string | boolean | number;
}

interface AnalysisData {
  title: string;
  description: string;
  parameters: AnalysisParameters;
}

const defaultAnalysis: AnalysisData = {
  title: '',
  description: '',
  parameters: {},
};

export function AnalysisBuilder() {
  const [analysis, setAnalysis] = useState<AnalysisData>(defaultAnalysis);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof AnalysisData, value: string) => {
    setAnalysis((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFieldChange = (name: string, value: boolean | string | number) => {
    setAnalysis((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await analysisService.createAnalysis({
        query: analysis.title,
        parameters: {
          description: analysis.description,
          ...analysis.parameters,
        },
      });

      toast({
        title: 'Success',
        description: 'Analysis created successfully',
      });

      // Reset form
      setAnalysis(defaultAnalysis);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create analysis',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Analysis Title</Label>
          <Input
            id="title"
            value={analysis.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={analysis.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Analysis Parameters</Label>
          {Object.entries(defaultConfig).map(([name, config]) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={name}
                checked={analysis.parameters[name] as boolean || false}
                onCheckedChange={(checked: boolean) => handleFieldChange(name, checked)}
              />
              <Label htmlFor={name}>{config.label}</Label>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Analysis...' : 'Create Analysis'}
        </button>
      </form>
    </Card>
  );
}
