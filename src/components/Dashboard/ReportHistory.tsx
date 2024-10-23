"use client"

import React, { useState, useEffect } from 'react'
import { Search, Trash2, CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DateRange } from "react-day-picker"

interface Report {
  id: string;
  name: string;
  creationDate: Date;
  status: 'Completed' | 'Failed' | 'In Progress';
  type: string;
  prompt: string;
  findings: string;
  citations: string[];
  methodology: string;
  confidence: number;
}

interface ReportHistoryProps {
  onReportClick: (reportId: string) => void;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ onReportClick }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    // Simulated API call to fetch reports
    const fetchReports = async () => {
      // This would be replaced with an actual API call
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Q4 Financial Analysis',
          creationDate: new Date('2024-10-01'),
          status: 'Completed',
          type: 'Financial',
          prompt: 'Analyze the financial performance of our company in Q4 2024',
          findings: 'The company showed strong growth in Q4, with revenue increasing by 15% year-over-year.',
          citations: ['Annual Report 2024', 'Q4 Earnings Call Transcript'],
          methodology: 'We analyzed financial statements, market trends, and competitor data.',
          confidence: 95
        },
        {
          id: '2',
          name: 'Market Trend Report',
          creationDate: new Date('2024-10-05'),
          status: 'In Progress',
          type: 'Market',
          prompt: 'Identify emerging trends in the tech industry for 2025',
          findings: 'Preliminary findings suggest AI and quantum computing will be major trends.',
          citations: ['Gartner 2025 Predictions', 'MIT Technology Review'],
          methodology: 'We are conducting surveys, analyzing patent filings, and reviewing industry reports.',
          confidence: 80
        },
        {
          id: '3',
          name: 'Competitor Analysis',
          creationDate: new Date('2024-10-10'),
          status: 'Failed',
          type: 'Competitor',
          prompt: 'Analyze the market share and strategies of our top 3 competitors',
          findings: 'The analysis could not be completed due to insufficient data.',
          citations: [],
          methodology: 'We attempted to gather public financial data and conduct customer surveys.',
          confidence: 30
        },
      ]
      setReports(mockReports)
    }
    fetchReports()
  }, [])

  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!dateRange?.from || report.creationDate >= dateRange.from) &&
    (!dateRange?.to || report.creationDate <= dateRange.to)
  )

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      return b.creationDate.getTime() - a.creationDate.getTime()
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status)
    } else {
      return a.type.localeCompare(b.type)
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(report => report.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <ScrollArea className="h-[300px]">
        <ul className="space-y-4">
          {sortedReports.map(report => (
            <li key={report.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onReportClick(report.id)}>
                <Badge variant={report.status === 'Completed' ? 'default' : report.status === 'In Progress' ? 'secondary' : 'destructive'}>
                  {report.status}
                </Badge>
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-gray-500">{format(report.creationDate, 'PPP')}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(report.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

export default ReportHistory
