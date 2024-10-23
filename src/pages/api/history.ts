import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const history = await prisma.processedData.findMany({
        orderBy: {
          date: 'desc',
        },
      });
      res.status(200).json(history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
