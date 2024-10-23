import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reports = await prisma.processResult.findMany({
        select: {
          processId: true,
          startTime: true,
          status: true,
        },
        orderBy: { startTime: 'desc' },
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
