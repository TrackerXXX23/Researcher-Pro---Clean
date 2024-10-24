import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const history = await prisma.analysis.findMany({
        orderBy: {
          created_at: 'desc'
        },
        include: {
          reports: true
        }
      });

      return res.status(200).json(history);
    } catch (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
