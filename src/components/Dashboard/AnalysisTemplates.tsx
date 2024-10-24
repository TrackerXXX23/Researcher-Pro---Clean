import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AnalysisTemplate, templateService } from '@/services/templateService';

interface AnalysisTemplatesProps {
  onSelectTemplate: (template: AnalysisTemplate) => void;
}

export function AnalysisTemplates({ onSelectTemplate }: AnalysisTemplatesProps) {
  const [templates, setTemplates] = useState<AnalysisTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const loadedTemplates = await templateService.listTemplates();
    setTemplates(loadedTemplates);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (template: AnalysisTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScrollArea className="h-[600px] pr-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                selectedTemplate?.id === template.id ? 'border-blue-500' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <p className="text-sm text-gray-500">{template.description}</p>
                <div className="flex flex-wrap gap-2">
                  {template.parameters.dataPoints?.map((point, index) => (
                    <Badge key={index} variant="outline">
                      {point}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">
                    v{template.version}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </ScrollArea>

        {selectedTemplate && (
          <Card className="p-4 col-span-2">
            <h3 className="text-lg font-semibold mb-4">Template Preview</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Parameters</h4>
                <pre className="bg-gray-100 p-2 rounded-md mt-2 text-sm">
                  {JSON.stringify(selectedTemplate.parameters, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium">Prompts</h4>
                <div className="space-y-2 mt-2">
                  {selectedTemplate.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="bg-gray-100 p-2 rounded-md text-sm"
                    >
                      <Badge className="mb-1">{prompt.type}</Badge>
                      <p>{prompt.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium">Validation Rules</h4>
                <pre className="bg-gray-100 p-2 rounded-md mt-2 text-sm">
                  {JSON.stringify(selectedTemplate.validation, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
