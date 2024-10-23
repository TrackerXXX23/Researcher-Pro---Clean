"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { StartNewAnalysisProps } from "@/interfaces"

export default function StartNewAnalysis({ isOpen, onClose }: StartNewAnalysisProps) {
  const [analysisDepth, setAnalysisDepth] = useState('')
  const [topic, setTopic] = useState('')
  const [clientSegment, setClientSegment] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [industryType, setIndustryType] = useState('')
  const [outputType, setOutputType] = useState('')
  const [customDepth, setCustomDepth] = useState('')
  const [customSegment, setCustomSegment] = useState('')
  const [customJurisdiction, setCustomJurisdiction] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [customOutput, setCustomOutput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<{ [key: string]: string }>({})

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(event.target.files)])
    }
  }

  const handleFileDescription = (fileName: string, description: string) => {
    setFileDescriptions({ ...fileDescriptions, [fileName]: description })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Process the form data here
    console.log({
      analysisDepth: analysisDepth === 'Custom' ? customDepth : analysisDepth,
      topic,
      clientSegment: clientSegment === 'Other' ? customSegment : clientSegment,
      jurisdiction: jurisdiction === 'Other' ? customJurisdiction : jurisdiction,
      industryType: industryType === 'Other' ? customIndustry : industryType,
      outputType: outputType === 'Custom' ? customOutput : outputType,
      uploadedFiles,
      fileDescriptions
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Start New Analysis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="analysisDepth" className="text-right">
                Analysis Depth
              </Label>
              <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select analysis depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Overview">Overview</SelectItem>
                  <SelectItem value="Detailed">Detailed</SelectItem>
                  <SelectItem value="Full Report">Full Report</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {analysisDepth === 'Custom' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customDepth" className="text-right">
                  Custom Depth
                </Label>
                <Input
                  id="customDepth"
                  value={customDepth}
                  onChange={(e) => setCustomDepth(e.target.value)}
                  className="col-span-3"
                  placeholder="Specify custom analysis depth"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Topic
              </Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="col-span-3"
                placeholder="Enter research topic or analysis request..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientSegment" className="text-right">
                Client Segment
              </Label>
              <Select value={clientSegment} onValueChange={setClientSegment}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select client segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High Net Worth Individuals">High Net Worth Individuals</SelectItem>
                  <SelectItem value="Farm Owners/Operators">Farm Owners/Operators</SelectItem>
                  <SelectItem value="Oilfield Service Business Owners">Oilfield Service Business Owners</SelectItem>
                  <SelectItem value="Corporate Entities (Small to Mid-Size)">Corporate Entities (Small to Mid-Size)</SelectItem>
                  <SelectItem value="Entrepreneurs/Business Owners in Growth">Entrepreneurs/Business Owners in Growth</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {clientSegment === 'Other' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customSegment" className="text-right">
                  Custom Segment
                </Label>
                <Input
                  id="customSegment"
                  value={customSegment}
                  onChange={(e) => setCustomSegment(e.target.value)}
                  className="col-span-3"
                  placeholder="Specify custom client segment"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jurisdiction" className="text-right">
                Jurisdiction
              </Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saskatchewan (SK)">Saskatchewan (SK)</SelectItem>
                  <SelectItem value="Alberta (AB)">Alberta (AB)</SelectItem>
                  <SelectItem value="SK/AB Cross-Jurisdiction">SK/AB Cross-Jurisdiction</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {jurisdiction === 'Other' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customJurisdiction" className="text-right">
                  Custom Jurisdiction
                </Label>
                <Input
                  id="customJurisdiction"
                  value={customJurisdiction}
                  onChange={(e) => setCustomJurisdiction(e.target.value)}
                  className="col-span-3"
                  placeholder="Specify custom jurisdiction"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industryType" className="text-right">
                Industry Type
              </Label>
              <Select value={industryType} onValueChange={setIndustryType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select industry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agriculture & Farming Operations">Agriculture & Farming Operations</SelectItem>
                  <SelectItem value="Oilfield Services & Maintenance">Oilfield Services & Maintenance</SelectItem>
                  <SelectItem value="Small Business Operations & Expansion">Small Business Operations & Expansion</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {industryType === 'Other' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customIndustry" className="text-right">
                  Custom Industry
                </Label>
                <Input
                  id="customIndustry"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="col-span-3"
                  placeholder="Specify custom industry type"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outputType" className="text-right">
                Output Type
              </Label>
              <Select value={outputType} onValueChange={setOutputType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF Report">PDF Report</SelectItem>
                  <SelectItem value="Email Summary">Email Summary</SelectItem>
                  <SelectItem value="Presentation Deck">Presentation Deck</SelectItem>
                  <SelectItem value="Raw Data Export">Raw Data Export</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {outputType === 'Custom' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customOutput" className="text-right">
                  Custom Output
                </Label>
                <Input
                  id="customOutput"
                  value={customOutput}
                  onChange={(e) => setCustomOutput(e.target.value)}
                  className="col-span-3"
                  placeholder="Specify custom output type"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileUpload" className="text-right">
                Upload Documents
              </Label>
              <Input
                id="fileUpload"
                type="file"
                onChange={handleFileUpload}
                className="col-span-3"
                multiple
              />
            </div>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`fileDescription-${index}`} className="text-right">
                  {file.name}
                </Label>
                <Input
                  id={`fileDescription-${index}`}
                  value={fileDescriptions[file.name] || ''}
                  onChange={(e) => handleFileDescription(file.name, e.target.value)}
                  className="col-span-3"
                  placeholder="Optional description"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Start Analysis</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
