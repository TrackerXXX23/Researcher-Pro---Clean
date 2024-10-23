import React from 'react'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AnalysisTemplates: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Analysis Templates</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Quarterly Financial Review</span>
        </li>
        <li className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Market Entry Strategy</span>
        </li>
        <li className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Risk Assessment</span>
        </li>
      </ul>
    </CardContent>
  </Card>
)

export default AnalysisTemplates
