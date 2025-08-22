import asyncio
import json
import websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/chat/"
    async with websockets.connect(uri) as websocket:
        print("Connected to server")

        await websocket.send(json.dumps({"message": "Hello from websocket"}))
        print("Sent hello message")

        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(test_ws())