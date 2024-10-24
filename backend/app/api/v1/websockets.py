from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, List
import logging
import json
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, analysis_id: str):
        try:
            # Accept all connections during development
            await websocket.accept()
            if analysis_id not in self.active_connections:
                self.active_connections[analysis_id] = []
            self.active_connections[analysis_id].append(websocket)
            logger.info(f"Client connected to analysis {analysis_id}")

            # Send initial status
            await websocket.send_json({
                "type": "connection_status",
                "data": {
                    "status": "connected",
                    "analysisId": analysis_id
                }
            })
            return True
        except Exception as e:
            logger.error(f"Error connecting websocket: {str(e)}")
            return False

    def disconnect(self, websocket: WebSocket, analysis_id: str):
        try:
            if analysis_id in self.active_connections:
                self.active_connections[analysis_id].remove(websocket)
                if not self.active_connections[analysis_id]:
                    del self.active_connections[analysis_id]
                logger.info(f"Client disconnected from analysis {analysis_id}")
        except Exception as e:
            logger.error(f"Error disconnecting websocket: {str(e)}")

    async def broadcast_to_analysis(self, analysis_id: str, message: dict):
        if analysis_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[analysis_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {str(e)}")
                    disconnected.append(connection)
            
            for connection in disconnected:
                self.disconnect(connection, analysis_id)

manager = ConnectionManager()

def setup_websockets(app: FastAPI) -> FastAPI:
    @app.websocket("/ws/{analysis_id}")
    async def websocket_endpoint(websocket: WebSocket, analysis_id: str):
        logger.info(f"WebSocket connection attempt for analysis {analysis_id}")
        
        # Log headers for debugging
        logger.info(f"WebSocket headers: {websocket.headers}")
        
        if not analysis_id:
            logger.error("Analysis ID is required")
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close(code=1000)
            return

        try:
            # Accept the connection first
            await websocket.accept()
            logger.info(f"WebSocket connection accepted for analysis {analysis_id}")

            # Then set up the connection in the manager
            connected = await manager.connect(websocket, analysis_id)
            if not connected:
                logger.error("Failed to set up websocket connection in manager")
                if websocket.client_state != WebSocketState.DISCONNECTED:
                    await websocket.close(code=1011)
                return

            while True:
                try:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    await manager.broadcast_to_analysis(analysis_id, message)
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON received: {data}")
                except WebSocketDisconnect:
                    manager.disconnect(websocket, analysis_id)
                    break
                except Exception as e:
                    logger.error(f"WebSocket error: {str(e)}")
                    manager.disconnect(websocket, analysis_id)
                    break
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for analysis {analysis_id}")
            manager.disconnect(websocket, analysis_id)
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            manager.disconnect(websocket, analysis_id)
            if websocket.client_state != WebSocketState.DISCONNECTED:
                try:
                    await websocket.close(code=1011)
                except:
                    pass

    @app.get("/ws/health")
    async def websocket_health():
        return {"status": "healthy"}

    return app
