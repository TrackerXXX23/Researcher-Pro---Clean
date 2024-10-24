import { NextApiRequest, NextApiResponse } from 'next';
import { analysisService } from '@/services/analysisService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    const analysisId = parseInt(id, 10);
    if (isNaN(analysisId)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    const analysis = await analysisService.getAnalysis(analysisId);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analysis' 
    });
  }
}
