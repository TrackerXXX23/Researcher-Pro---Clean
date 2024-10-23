"use client"

import React, { useState } from 'react'
import { Search, Plus, BarChart2, TrendingUp, FileText, AlertCircle, BookOpen } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import ResearchProcessManager from './ResearchProcessManager'
import ReportHistory from './ReportHistory'
import StartNewAnalysis from './StartNewAnalysis'

interface ReportViewerProps {
  reportId: string;
  onClose: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Report Viewer</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div>
          <p>Viewing report {reportId}</p>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { toast } = useToast()
  const [analysisIdea, setAnalysisIdea] = useState('')
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false)

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId)
    setShowReportViewer(true)
  }

  const handleCloseReport = () => {
    setShowReportViewer(false)
    setSelectedReportId(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Search initiated",
      description: `Searching for: ${searchTerm}`,
    })
  }

  const handleNavClick = (page: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${page} page`,
    })
  }

  const handleSuggestedAnalysis = (analysis: string) => {
    toast({
      title: "Suggested Analysis",
      description: `Starting ${analysis}`,
    })
  }

  const handleTrendingTopic = (topic: string) => {
    toast({
      title: "Trending Topic",
      description: `Exploring ${topic}`,
    })
  }

  const handleAnalysisTemplate = (template: string) => {
    toast({
      title: "Analysis Template",
      description: `Using ${template} template`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#635bff] to-[#00d4ff] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Researcher Pro</h1>
          <nav className="flex space-x-2">
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => handleNavClick('Home')}>Home</Button>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => handleNavClick('Analysis History')}>Analysis History</Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-[#635bff]">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[300px] rounded-full border-gray-200 bg-white/90 focus:bg-white transition-colors"
              />
            </form>
            <Button 
              className="bg-[#635bff] hover:bg-[#5147ff] text-white rounded-full flex items-center gap-2"
              size="sm"
              onClick={() => setIsNewAnalysisOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        <StartNewAnalysis 
          isOpen={isNewAnalysisOpen} 
          onClose={() => setIsNewAnalysisOpen(false)} 
        />

        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-8">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Analysis Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ResearchProcessManager analysisIdea={analysisIdea} />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-4">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Live Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="py-1">Update at 9:43:09 AM: Processing complete for dataset A</p>
                  <p className="py-1">Update at 9:43:14 AM: New data source identified</p>
                  <p className="py-1">Update at 9:43:19 AM: Significant correlation found in sector X</p>
                  <p className="py-1">Update at 9:43:24 AM: AI model training initiated</p>
                  <p className="py-1">Update at 9:43:29 AM: AI model training initiated</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportHistory onReportClick={handleReportClick} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Suggested Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {['Market Trend Analysis', 'Competitor Performance Review', 'Financial Forecast'].map((analysis, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      {index === 0 && <BarChart2 className="h-4 w-4 text-[#635bff]" />}
                      {index === 1 && <TrendingUp className="h-4 w-4 text-[#635bff]" />}
                      {index === 2 && <FileText className="h-4 w-4 text-[#635bff]" />}
                      {analysis}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#635bff] hover:text-[#5147ff] hover:bg-[#635bff]/5"
                      onClick={() => handleSuggestedAnalysis(analysis)}
                    >
                      Start
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {['Cryptocurrency Market Volatility', 'AI in Financial Services', 'ESG Investing Trends'].map((topic, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-[#635bff]" />
                      {topic}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#635bff] hover:text-[#5147ff] hover:bg-[#635bff]/5"
                      onClick={() => handleTrendingTopic(topic)}
                    >
                      Explore
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Analysis Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {['Quarterly Financial Review', 'Market Entry Strategy', 'Risk Assessment'].map((template, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 text-[#635bff]" />
                      {template}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#635bff] hover:text-[#5147ff] hover:bg-[#635bff]/5"
                      onClick={() => handleAnalysisTemplate(template)}
                    >
                      Use
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {showReportViewer && selectedReportId && (
        <ReportViewer reportId={selectedReportId} onClose={handleCloseReport} />
      )}
    </div>
  )
}
