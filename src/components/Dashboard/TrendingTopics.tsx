import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TrendingTopics: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Trending Topics</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span>Cryptocurrency Market Volatility</span>
        </li>
        <li className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span>AI in Financial Services</span>
        </li>
        <li className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span>ESG Investing Trends</span>
        </li>
      </ul>
    </CardContent>
  </Card>
)

export default TrendingTopics
