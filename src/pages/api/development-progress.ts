import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'docs', 'development', 'DevelopmentFlowsAndProgress.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const flows = parseMarkdownToFlows(fileContent);

      res.status(200).json({ flows });
    } catch (error) {
      console.error('Error reading development progress:', error);
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        res.status(404).json({ error: 'Development progress file not found' });
      } else {
        res.status(500).json({ error: 'Failed to fetch development progress' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function parseMarkdownToFlows(markdown: string) {
  const lines = markdown.split('\n');
  const flows = [];
  let currentFlow: any = null;
  let currentStep: any = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentFlow) flows.push(currentFlow);
      currentFlow = { name: line.substring(3).trim(), steps: [] };
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
      if (currentStep) currentFlow.steps.push(currentStep);
      const completed = line.startsWith('- [x] ');
      currentStep = {
        name: line.substring(6).trim(),
        completed,
        output: completed ? 'Step completed successfully' : ''
      };
    } else if (line.startsWith('  - [ ] ') || line.startsWith('  - [x] ')) {
      // These are sub-steps, we'll ignore them for now to keep the main flow simple
      continue;
    } else if (line.trim() !== '' && currentStep) {
      // Assume any non-empty line after a step is output
      currentStep.output += ' ' + line.trim();
    }
  }

  if (currentStep) currentFlow.steps.push(currentStep);
  if (currentFlow) flows.push(currentFlow);

  return flows;
}
