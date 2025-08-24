# Real-Time AI Chat Assistant

An end-to-end real-time AI chat application built with **Django Channels**, **React**, and **Ollama** (running a local model such as `gemma3:12b`).
Messages are streamed over WebSockets for a smooth chat experience.

---

## 🚀 Features

- **Django backend** with Channels (`ASGI`, WebSockets)
- **React frontend** with live chat interface
- **Ollama local model integration** (`gemma3:12b` or similar)
- **Streaming AI responses** (token-by-token) for a natural feel
- **Conversation memory** per connection
- Simple **reset/clear conversation** support (optional)

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, Django, Django Channels, httpx
- **Frontend**: React + WebSockets
- **AI Runtime**: [Ollama](https://ollama.com/) (local LLM runner)

---

## 📦 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-chat-assistant.git
cd ai-chat-assistant
```

### 2. Backend(Django + daphne)
#### Install dependencies
```
pip install -r requirements.txt
```
#### Run daphne server 
```
daphne -p 8000 backend.asgi:application
```

### 3. AI bacikend (Ollama)
#### Install Ollama
#### Pull Model
```
ollama pull gemma3:12b
```
#### verify API
Ollama exposes an API at http://localhost:11434
```
curl https://localhost:11434/api/tags
```

### 4. Frontend (React)
```
cd fronternd
npm install 
npm start
```

### Alternative one-shot startup
Requires Ollama endpoint to be accessible
```
# from root folder
chmod +x run_app.sh
run_app.sh
```
---


### Future Improvements
- Add authentication & multi-user sessions
- Save conversation history to DB
- Support multiple local/remote models
- UI improvements: markdown rendering, typing indicator, message timestamps

