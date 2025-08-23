import React, { useState, useEffect, useRef } from "react";

function App(){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const endRef = useRef(null);


  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/chat/");
    ws.current = socket;

    socket.onopen = () => setConnected(true);

    socket.onclose = () => {
      setConnected(false);
      setIsTyping(false);
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setMessages((prev) => [...prev, { sender: "System", text: `Error: ${data.error}` }]);
          setIsTyping(false);
          return;
        }

        if (data.done) {
          setIsTyping(false);
          return;
        }

        if (typeof data.message === "string") {
          setIsTyping(true);

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === "AI") {
              // append chunk to last AI message
              return [...prev.slice(0, -1), { sender: "AI", text: last.text + data.message }];
            } else {
              // start new AI message
              return [...prev, { sender: "AI", text: data.message }];
            }
          });
        }
      } catch (e) {
        console.error("Invalid JSON from server:", event.data);
      }
    };

    // cleanup on unmount
    return () => {
      try { socket.close(); } catch {}
    };
  }, []);

  // --- Auto scroll when messages or typing state changes ---
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    // show user message immediately
    setMessages((prev) => [...prev, { sender: "User", text }]);
    setInput("");

    // send JSON to backend
    ws.current.send(JSON.stringify({ message: text }));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // --- Simple styles ---
  const wrap = { maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif" };
  const chatBox = { border: "1px solid #ddd", borderRadius: 8, padding: 12, height: 480, overflowY: "auto", background: "#fafafa" };
  const row = (sender) => ({
    display: "flex",
    justifyContent: sender === "User" ? "flex-end" : "flex-start",
    margin: "6px 0"
  });
  const bubble = (sender) => ({
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: 14,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    background: sender === "User" ? "#dbeafe" : sender === "AI" ? "#e5e7eb" : "#fee2e2"
  });

  return (
    <div style={wrap}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        AI Chat Assistant
        <span
          title={connected ? "Connected" : "Disconnected"}
          style={{
            width: 10, height: 10, borderRadius: "50%",
            background: connected ? "#22c55e" : "#ef4444", display: "inline-block"
          }}
        />
      </h2>

      <div style={chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={row(m.sender)}>
            <div style={bubble(m.sender)}><b>{m.sender}:</b> {m.text}</div>
          </div>
        ))}

        {isTyping && (
          <div style={row("AI")}>
            <div style={bubble("AI")} aria-live="polite" aria-label="AI is typing">
              <b>AI:</b> <span style={{ opacity: 0.7 }}>typing…</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !input.trim()}
          style={{
            padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd",
            background: connected ? "#111827" : "#9ca3af", color: "white", cursor: connected ? "pointer" : "not-allowed"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;