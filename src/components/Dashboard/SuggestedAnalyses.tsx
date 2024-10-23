import React from 'react'
import { BarChart2, TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SuggestedAnalyses: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Suggested Analyses</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span>Market Trend Analysis</span>
        </li>
        <li className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>Competitor Performance Review</span>
        </li>
        <li className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Financial Forecast</span>
        </li>
      </ul>
    </CardContent>
  </Card>
)

export default SuggestedAnalyses
