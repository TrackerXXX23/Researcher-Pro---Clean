import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import AnalysisProcess from './AnalysisProcess'
import LiveUpdates from './LiveUpdates'
import GeneratedReports from './GeneratedReports'

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-purple-600 to-cyan-500 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto flex-1 space-y-6 p-6">
        {/* Search and New Analysis */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search analyses..."
              className="pl-9"
            />
          </div>
          <Button size="lg">
            New Analysis
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Analysis Process */}
          <Card className="p-6">
            <AnalysisProcess />
          </Card>

          {/* Live Updates */}
          <Card className="p-6">
            <LiveUpdates />
          </Card>
        </div>

        {/* Generated Reports */}
        <Card className="p-6">
          <GeneratedReports />
        </Card>
      </main>
    </div>
  )
}
