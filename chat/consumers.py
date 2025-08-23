import json
from channels.generic.websocket import AsyncWebsocketConsumer
import httpx

OLLAMA_API_URL = "http://localhost:11434/api/chat"

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.history = []
        await self.accept()  # accept incoming connection
        # await self.send(text_data=json.dumps({"message": "Connected to Django WS"}))

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

        self.history.append({"role": "user", "content": user_message})

        payload = {
            "model": "gemma3:12b",
            "messages": self.history,
            "stream": True
        }

        # async HTTP streaming via httpx
        response_text = ""
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", OLLAMA_API_URL, json=payload) as response:
                async for line in response.aiter_lines():
                     if line.strip():
                        try:
                            data = json.loads(line)
                            if "message" in data:
                                content = data["message"]["content"]
                                response_text += content
                                await self.send(text_data=json.dumps({"message": content}))
                        except Exception as e:
                            print("Stream parser error:", e)

        if response_text.strip():
            self.history.append({"role": "assistant", "content": response_text})
        # send a final message to indicate completion
        await self.send(text_data=json.dumps({"done": True}))