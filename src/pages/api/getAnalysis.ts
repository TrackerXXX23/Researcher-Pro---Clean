import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { ProcessedData, AnalysisResult } from '../../interfaces';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ProcessedDataWithInsights extends ProcessedData {
  insights: {
    id: number;
    processedDataId: number;
    analysis: string; // This is stored as a JSON string in the database
    keySummary: string;
    recommendations: string[];
    riskAssessment: string;
    significantChanges: boolean;
  } | null;
}

interface ProcessedDataWithParsedInsights extends Omit<ProcessedDataWithInsights, 'insights'> {
  insights: {
    id: number;
    processedDataId: number;
    analysis: AnalysisResult;
    keySummary: string;
    recommendations: string[];
    riskAssessment: string;
    significantChanges: boolean;
  } | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const latestAnalysis = await prisma.processedData.findFirst({
        orderBy: {
          id: 'desc'
        },
        include: {
          insights: {
            select: {
              id: true,
              processedDataId: true,
              analysis: true,
              keySummary: true,
              recommendations: true,
              riskAssessment: true,
              significantChanges: true,
            }
          }
        }
      }) as ProcessedDataWithInsights | null;

      if (latestAnalysis) {
        let parsedAnalysis: ProcessedDataWithParsedInsights;
        // Parse the analysis JSON string if it exists
        if (latestAnalysis.insights && latestAnalysis.insights.analysis) {
          parsedAnalysis = {
            ...latestAnalysis,
            insights: {
              ...latestAnalysis.insights,
              analysis: JSON.parse(latestAnalysis.insights.analysis) as AnalysisResult
            }
          };
        } else {
          parsedAnalysis = latestAnalysis as ProcessedDataWithParsedInsights;
        }
        res.status(200).json(parsedAnalysis);
      } else {
        res.status(404).json({ message: 'No analysis found' });
      }
    } catch (error) {
      console.error('Detailed error in getAnalysis:', error);
      
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle database-specific errors
        console.error('Database error:', error.code, error.message);
        res.status(500).json({ error: 'A database error occurred while retrieving the analysis.' });
      } else if (error instanceof SyntaxError) {
        // Handle JSON parsing errors
        console.error('JSON parsing error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the analysis data.' });
      } else {
        // Generic error handling
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
