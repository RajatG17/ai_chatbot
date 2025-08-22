import json
from channels.generic.websocket import AsyncWebsocketConsumer
import httpx

OLLAMA_API_URL = "http://localhost:11434/api/chat"

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()  # accept incoming connection

    async def disconnect(self, close_code):
        pass  # optional cleanup

    async def receive(self, text_data):
        """
        Receive JSON from frontend: {"message": "..."}
        Forward to Ollama, stream responses back via WebSocket
        """
        print("Received over WS:", repr(text_data))

        if not text_data:
            await self.send(text_data=json.dumps({"error": "Empty message"}))
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))
            return

        user_message = data.get("message", "").strip()
        if not user_message:
            await self.send(text_data=json.dumps({"error": "No message provided"}))
            return

        payload = {
            "model": "gemma3:12b",
            "messages": [{"role": "user", "content": user_message}],
            "stream": True
        }

        # async HTTP streaming via httpx
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", OLLAMA_API_URL, json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        # forward each line to frontend
                        await self.send(text_data=line)
