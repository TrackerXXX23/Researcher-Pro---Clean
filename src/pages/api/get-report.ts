import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { processId } = req.query;

      console.log(`Fetching report for processId: ${processId}`);

      if (!processId || typeof processId !== 'string') {
        console.error('Invalid process ID:', processId);
        return res.status(400).json({ error: 'Invalid process ID' });
      }

      const processResult = await prisma.processResult.findUnique({
        where: { processId },
      });

      console.log('Process result:', processResult);

      if (!processResult) {
        console.error('Process result not found for processId:', processId);
        return res.status(404).json({ error: 'Process result not found' });
      }

      if (!processResult.reportPath) {
        console.error('Report path not found for processId:', processId);
        return res.status(404).json({ error: 'Report not found for this process' });
      }

      console.log('Attempting to read report file:', processResult.reportPath);

      const reportContent = await fs.readFile(processResult.reportPath, 'utf-8');

      console.log('Report content length:', reportContent.length);

      if (reportContent.length === 0) {
        console.warn('Report file is empty for processId:', processId);
      }

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(reportContent);
    } catch (error) {
      console.error('Error retrieving report:', error);
      res.status(500).json({ error: 'Failed to retrieve the report' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
