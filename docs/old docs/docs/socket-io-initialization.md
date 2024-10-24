# Socket.io Initialization Documentation

## Overview

This document outlines the steps taken to resolve Socket.io initialization issues in our Next.js application and successfully run the build and start processes.

## Changes Made

### 1. Global Type Declaration

We modified the `src/global.d.ts` file to properly declare the global `io` variable:

```typescript
import { Server as SocketIOServer } from 'socket.io';

declare global {
  namespace NodeJS {
    interface Global {
      io: SocketIOServer | undefined;
    }
  }
}

export {};
```

This change ensures that TypeScript recognizes the `io` property on the global object.

### 2. API Route Modification

We updated the `src/pages/api/start-process.ts` file to correctly access the global `io` instance:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { startProcess } from '../../services/processService';
import { Server as SocketIOServer } from 'socket.io';

interface GlobalWithIO {
  io: SocketIOServer | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const globalWithIO = global as unknown as GlobalWithIO;
      
      console.log('Socket.io initialized:', !!globalWithIO.io);

      if (!globalWithIO.io) {
        throw new Error('Socket.io not initialized');
      }
      
      const processId = await startProcess(globalWithIO.io);
      res.status(200).json({ processId });
    } catch (error) {
      console.error('Error starting the process:', error);
      res.status(500).json({ error: 'Failed to start the process.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

This change allows the API route to safely access the global `io` instance while maintaining type safety.

## Build and Start Process

After making these changes, we successfully ran the build and start processes:

1. `npm run build`: This command generates an optimized production build of the application.
2. `npm start`: This command starts the server in production mode.

The server now starts without any Socket.io initialization errors and is ready to handle client connections and process updates.

## Verification

We verified the successful initialization of Socket.io through the following console outputs:

```
> Ready on http://localhost:3000
> Socket.io initialized: true
Client connected to process updates
Client connected to process updates
Client connected to process updates
Socket.io initialized: true
```

These logs confirm that Socket.io is properly initialized and the server is ready to handle WebSocket connections.

## Conclusion

By making these changes, we resolved the Socket.io initialization issues and ensured that our Next.js application can properly utilize WebSocket connections in production. The application is now running smoothly and is ready for further development and testing.
