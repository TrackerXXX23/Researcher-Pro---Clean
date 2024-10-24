import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { processId } = req.query;

    if (!processId || typeof processId !== 'string') {
      return res.status(400).json({ message: 'Process ID is required' });
    }

    const processResult = await prisma.processResult.findUnique({
      where: {
        processId: processId
      }
    });

    if (!processResult) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(processResult);
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
