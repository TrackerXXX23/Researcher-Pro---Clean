"use client"

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from 'react-hook-form'

interface NewAnalysisButtonProps {
  onAnalysisGenerated: (idea: string) => void
}

interface AnalysisFormData {
  category: string
  clientSegment: string
  timeHorizon: number
}

const CustomAnalysisBuilder: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm<AnalysisFormData>()

  const onSubmitForm = (data: AnalysisFormData) => {
    console.log(data)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          {...register('category')}
          placeholder="e.g., Financial, Market, Competitor"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientSegment">Client Segment</Label>
        <Input
          id="clientSegment"
          {...register('clientSegment')}
          placeholder="e.g., Small Business, Enterprise, Government"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeHorizon">Time Horizon (months)</Label>
        <Input
          id="timeHorizon"
          type="number"
          {...register('timeHorizon', { valueAsNumber: true })}
          placeholder="e.g., 3, 6, 12"
        />
      </div>
      <Button type="submit" className="w-full">Generate Analysis Idea</Button>
    </form>
  )
}

const NewAnalysisButton: React.FC<NewAnalysisButtonProps> = ({ onAnalysisGenerated }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleAnalysisGeneration = () => {
    setIsOpen(false)
    // Simulate generating an analysis idea
    const generatedIdea = "Conduct a comprehensive market analysis for emerging trends in sustainable energy technologies."
    onAnalysisGenerated(generatedIdea)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Analysis Builder</DialogTitle>
        </DialogHeader>
        <CustomAnalysisBuilder onSubmit={handleAnalysisGeneration} />
      </DialogContent>
    </Dialog>
  )
}

export default NewAnalysisButton
