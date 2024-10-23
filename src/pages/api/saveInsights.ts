import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { AnalysisResult } from '../../interfaces';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { processedDataId, analysis } = req.body as { processedDataId: number, analysis: AnalysisResult };

      // Validate required fields
      const requiredFields = ['insightSummary', 'keySummary', 'recommendations', 'riskAssessment', 'significantChanges'];
      const missingFields = requiredFields.filter(field => !(field in analysis));

      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
      }

      const result = await prisma.insights.create({
        data: {
          processedDataId,
          analysis: JSON.stringify(analysis),
          insightSummary: analysis.insightSummary,
          keySummary: analysis.keySummary,
          recommendations: analysis.recommendations,
          riskAssessment: analysis.riskAssessment,
          significantChanges: analysis.significantChanges,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Detailed error in saveInsights:', error);
      
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle database-specific errors
        console.error('Database error:', error.code, error.message);
        res.status(500).json({ error: 'A database error occurred while saving insights.' });
      } else {
        // Generic error handling
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
