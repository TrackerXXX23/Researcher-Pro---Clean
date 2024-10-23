import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const processResults = await prisma.processResult.findMany({
        orderBy: { startTime: 'desc' },
        select: {
          id: true,
          processId: true,
          startTime: true,
          endTime: true,
          status: true,
          reportPath: true,
        },
      });

      res.status(200).json(processResults);
    } catch (error) {
      console.error('Detailed error in process-results:', error);
      
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle database-specific errors
        console.error('Database error:', error.code, error.message);
        res.status(500).json({ error: 'A database error occurred while fetching process results.' });
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
