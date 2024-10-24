from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, analysis_id: str):
        await websocket.accept()
        if analysis_id not in self.active_connections:
            self.active_connections[analysis_id] = []
        self.active_connections[analysis_id].append(websocket)
        logger.info(f"Client connected to analysis {analysis_id}")

    def disconnect(self, websocket: WebSocket, analysis_id: str):
        if analysis_id in self.active_connections:
            self.active_connections[analysis_id].remove(websocket)
            if not self.active_connections[analysis_id]:
                del self.active_connections[analysis_id]
            logger.info(f"Client disconnected from analysis {analysis_id}")

    async def broadcast_to_analysis(self, analysis_id: str, message: dict):
        if analysis_id in self.active_connections:
            for connection in self.active_connections[analysis_id]:
                try:
                    await connection.send_json(message)
                except:
                    await connection.close()

# Create a single instance to be used across the app
manager = ConnectionManager()
