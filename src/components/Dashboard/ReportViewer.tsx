import React from 'react'
import { ArrowLeft, Download, Share2, Star, MessageSquare } from 'lucide-react'
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface ReportViewerProps {
  report: Report;
  onClose: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{report.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>
      <main className="flex-grow overflow-auto">
        <div className="container mx-auto py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Report Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p>{report.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={report.status === 'Completed' ? 'default' : report.status === 'In Progress' ? 'secondary' : 'destructive'}>
                    {report.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{format(report.creationDate, 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <Progress value={report.confidence} className="w-full mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="findings" className="w-full">
            <TabsList>
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="methodology">Methodology</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
            </TabsList>
            <TabsContent value="findings">
              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{report.findings}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="prompt">
              <Card>
                <CardHeader>
                  <CardTitle>Research Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{report.prompt}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="methodology">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{report.methodology}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="citations">
              <Card>
                <CardHeader>
                  <CardTitle>Citations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {report.citations.map((citation, index) => (
                      <li key={index}>{citation}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
          <Button onClick={onClose}>Close Report</Button>
        </div>
      </footer>
    </div>
  )
}

export default ReportViewer
