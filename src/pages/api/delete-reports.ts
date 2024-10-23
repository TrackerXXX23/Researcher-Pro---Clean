import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reportIds } = req.body;

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: 'Invalid reportIds' });
    }

    // Delete the reports
    await prisma.processResult.deleteMany({
      where: {
        processId: {
          in: reportIds,
        },
      },
    });

    res.status(200).json({ message: 'Reports deleted successfully' });
  } catch (error) {
    console.error('Error deleting reports:', error);
    res.status(500).json({ message: 'Error deleting reports' });
  }
}
