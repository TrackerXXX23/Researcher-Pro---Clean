import asyncio
import websockets
import json
import logging
import signal
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flag to control the main loop
running = True

def handle_signal(signum, frame):
    """Handle interrupt signal"""
    global running
    logger.info("Received interrupt signal, shutting down...")
    running = False

async def test_websocket_connection():
    """Test WebSocket connection with the backend."""
    analysis_id = "test-analysis-123"
    uri = f"ws://localhost:8002/ws/{analysis_id}"
    
    try:
        logger.info(f"Attempting to connect to {uri}")
        async with websockets.connect(uri) as websocket:
            logger.info("Successfully connected to WebSocket server")

            # Wait for initial connection message
            response = await websocket.recv()
            logger.info(f"Received initial message: {response}")

            # Send a test message
            test_message = {
                "type": "test",
                "data": {
                    "message": "Hello from test client"
                }
            }
            await websocket.send(json.dumps(test_message))
            logger.info(f"Sent test message: {test_message}")

            # Wait for response
            response = await websocket.recv()
            logger.info(f"Received response: {response}")

            # Keep connection open and receive messages until interrupted
            logger.info("Waiting for updates (Press Ctrl+C to stop)...")
            while running:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    logger.info(f"Received update: {response}")
                except asyncio.TimeoutError:
                    # Timeout is expected, just continue waiting
                    continue
                except websockets.exceptions.ConnectionClosed:
                    logger.info("Connection closed by server")
                    break

    except websockets.exceptions.InvalidStatusCode as e:
        logger.error(f"Failed to connect: {e}")
        logger.error(f"Status code: {e.status_code}")
        logger.error(f"Headers: {e.headers}")
    except Exception as e:
        logger.error(f"Error during WebSocket test: {e}")

if __name__ == "__main__":
    # Set up signal handler
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    logger.info("Starting WebSocket test")
    asyncio.get_event_loop().run_until_complete(test_websocket_connection())
