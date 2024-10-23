import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SystemPerformance: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>System Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li className="flex items-center justify-between">
          <span>AI Model Accuracy</span>
          <span className="font-semibold">95%</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Average Analysis Time</span>
          <span className="font-semibold">2.5 minutes</span>
        </li>
        <li className="flex items-center justify-between">
          <span>User Satisfaction</span>
          <span className="font-semibold">4.8/5</span>
        </li>
      </ul>
    </CardContent>
  </Card>
)

export default SystemPerformance
