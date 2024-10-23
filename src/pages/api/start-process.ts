import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { ResearchService } from '@/services/researchService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const io = (res.socket as any).server.io as SocketIOServer;
    if (!io) {
      throw new Error('Socket.IO server not initialized');
    }

    const processId = Date.now().toString();
    const researchService = new ResearchService(io);

    // Start the process asynchronously
    researchService.runProcess(processId).catch(error => {
      console.error('Research process error:', error);
      io.emit('processUpdate', {
        processId,
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    });

    // Send initial process state
    io.emit('processUpdate', {
      processId,
      status: 'running',
      stepId: 'data-collection',
      progress: 0,
      details: 'Starting data collection...'
    });

    // Send live update
    io.emit('liveUpdate', {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: 'Process started',
      type: 'info'
    });

    return res.status(200).json({ processId });
  } catch (error) {
    console.error('Error starting process:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start process' 
    });
  }
}
