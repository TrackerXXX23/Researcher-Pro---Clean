import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { ResearchService } from '@/services/researchService';

const getResearchService = (io: SocketIOServer) => {
  if (!(global as any).researchService) {
    (global as any).researchService = new ResearchService(io);
  }
  return (global as any).researchService as ResearchService;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const processId = req.query.processId as string;
  const io = (res.socket as any).server.io as SocketIOServer;

  if (!io) {
    return res.status(500).json({ error: 'Socket.IO server not initialized' });
  }

  if (!processId) {
    return res.status(400).json({ error: 'Process ID is required' });
  }

  const researchService = getResearchService(io);

  switch (method) {
    case 'GET':
      try {
        return res.status(200).json({ status: 'success' });
      } catch (error) {
        console.error('Error fetching process:', error);
        return res.status(500).json({ error: 'Failed to fetch process' });
      }

    case 'PUT':
      try {
        const { action } = JSON.parse(req.body);
        
        if (action === 'pause') {
          researchService.pauseProcess(processId);
        } else if (action === 'resume') {
          researchService.resumeProcess(processId);
        }

        return res.status(200).json({ message: `Process ${action}d successfully` });
      } catch (error) {
        console.error('Error updating process:', error);
        return res.status(500).json({ error: 'Failed to update process' });
      }

    case 'DELETE':
      try {
        researchService.stopProcess(processId);
        return res.status(200).json({ message: 'Process stopped successfully' });
      } catch (error) {
        console.error('Error stopping process:', error);
        return res.status(500).json({ error: 'Failed to stop process' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
