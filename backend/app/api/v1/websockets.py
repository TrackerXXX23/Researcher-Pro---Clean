from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError
from app.core.security import verify_token

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

async def notify_analysis_update(user_id: str, analysis_id: str, status: str, progress: float = None):
    message = {
        "type": "analysis_update",
        "analysis_id": analysis_id,
        "status": status
    }
    if progress is not None:
        message["progress"] = progress
    await manager.send_personal_message(message, user_id)

async def websocket_auth(websocket: WebSocket) -> str:
    try:
        token = websocket.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            await websocket.close(code=4001, reason="Invalid authentication")
            return None
        
        token = token.split(" ")[1]
        user_id = verify_token(token)
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return None
        
        return user_id
    except (JWTError, IndexError):
        await websocket.close(code=4001, reason="Invalid authentication")
        return None

async def websocket_endpoint(websocket: WebSocket):
    user_id = await websocket_auth(websocket)
    if not user_id:
        return

    try:
        await manager.connect(websocket, user_id)
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
