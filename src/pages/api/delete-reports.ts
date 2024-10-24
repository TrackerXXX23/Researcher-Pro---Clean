import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reportIds } = req.body;

    if (!Array.isArray(reportIds)) {
      return res.status(400).json({ message: 'Report IDs must be an array' });
    }

    await prisma.processResult.deleteMany({
      where: {
        processId: {
          in: reportIds
        }
      }
    });

    return res.status(200).json({ message: 'Reports deleted successfully' });
  } catch (error) {
    console.error('Error deleting reports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
