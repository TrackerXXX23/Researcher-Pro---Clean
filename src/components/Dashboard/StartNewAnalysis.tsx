import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWebSocket } from '@/services/websocketService';

interface StartNewAnalysisProps {
  onAnalysisStart: (topic: string) => void;
}

export const StartNewAnalysis: React.FC<StartNewAnalysisProps> = ({ onAnalysisStart }) => {
  const [topic, setTopic] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { connectionState } = useWebSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onAnalysisStart(topic.trim());
      setTopic('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          Start New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Analysis</DialogTitle>
          <DialogDescription>
            Enter a topic or research question to begin a new analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="topic"
              placeholder="Enter research topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!topic.trim() || connectionState !== 'connected'}
            >
              Start Analysis
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartNewAnalysis;
