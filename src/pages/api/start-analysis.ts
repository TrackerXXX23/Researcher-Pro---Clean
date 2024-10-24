import { NextApiRequest, NextApiResponse } from 'next';
import { authService } from '../../services/authService';
import { analysisService } from '../../services/analysisService';
import { AnalysisFormData } from '../../types/analysis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const formData = req.body as AnalysisFormData;

    // Transform form data to match backend expectations
    const analysisData = {
      query: formData.topic,
      parameters: {
        depth: formData.analysisDepth,
        clientSegment: formData.clientSegment,
        jurisdiction: formData.jurisdiction,
        industryType: formData.industryType,
        outputType: formData.outputType,
        ...formData.parameters,
      }
    };

    // Create analysis using the service
    const analysis = await analysisService.createAnalysis(analysisData);

    // Return the created analysis
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in start-analysis:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start analysis'
    });
  }
}
