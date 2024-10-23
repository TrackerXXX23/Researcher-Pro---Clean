"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, RotateCw, FileText } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ResearchProcessManagerProps {
  analysisIdea?: string;
}

const ResearchProcessManager: React.FC<ResearchProcessManagerProps> = ({ analysisIdea }) => {
  const [steps] = useState([
    { 
      id: 'data-collection',
      name: 'Data Collection',
      icon: <Search className="w-4 h-4" />,
      progress: 100,
      status: 'completed'
    },
    {
      id: 'processing',
      name: 'Processing',
      icon: <RotateCw className="w-4 h-4" />,
      progress: 100,
      status: 'completed'
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      icon: <Search className="w-4 h-4" />,
      progress: 75,
      status: 'in-progress'
    },
    {
      id: 'report-creation',
      name: 'Report Creation',
      icon: <FileText className="w-4 h-4" />,
      progress: 5,
      status: 'in-progress'
    }
  ])

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Analysis Process</h2>
      
      {analysisIdea && (
        <div className="mb-4 text-sm text-gray-600">
          Analyzing: {analysisIdea}
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="group">
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  step.status === 'completed' ? 'bg-green-100' :
                  step.status === 'in-progress' ? 'bg-blue-100' :
                  'bg-gray-100'
                )}>
                  {step.icon}
                </div>
                <span className="font-medium text-gray-900">{step.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                {step.progress > 0 && (
                  <span className="text-sm text-gray-500">{step.progress}%</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700"
          >
            Pause
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700"
          >
            Rerun
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Estimated completion: 9:43:39 AM
        </div>
      </div>
    </div>
  )
}

export default ResearchProcessManager
