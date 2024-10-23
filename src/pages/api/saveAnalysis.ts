import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { 
        category, 
        clientSegment, 
        legalJurisdiction, 
        industryFocus, 
        strategyType, 
        prompt,
        rawData,
        source,
        priority
      } = req.body;

      const result = await prisma.processedData.create({
        data: {
          prompt: prompt || 'Default prompt',
          rawData: rawData || '',
          source: source || 'Unknown',
          category,
          clientSegment,
          legalJurisdiction,
          industryFocus,
          strategyType,
          priority: priority || 0,
          // date will be set automatically due to @default(now()) in the schema
        },
      });

      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('Failed to save analysis:', error);
      res.status(500).json({ 
        error: 'Failed to save analysis', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
