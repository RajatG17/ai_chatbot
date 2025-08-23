import React, { useState, useEffect, useRef } from "react";

function App(){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/chat/");

    ws.current.onmessage = (event) => {
      try{
        const data = JSON.parse(event.data);

        if (data.done){
          setIsTyping(false);
        }

        setIsTyping(true);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
      
          if (lastMessage && lastMessage.sender === "AI") {
            // Append new chunk to the last AI message
            return [
              ...prev.slice(0, -1),
              { sender: "AI", text: lastMessage.text + data.message }
            ];
          } else {
            // Start a new AI message if none exists
            return [...prev, { sender: "AI", text: data.message }];
          }
        });

      }catch(error){
        console.error("Invalid JSON:", event.data);
      }

    };

    ws.current.onclose = () => console.log("WebSocket closed");
    ws.current.onerror = (error) => console.error("Websocket error:", error);

    return (() => ws.current.close())

  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      ws.current.send(JSON.stringify({ message: input }));
  
      setMessages((prev) => [...prev, { sender: "User", text: input }]);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "sans-serif"}}>
      <h2 style={{ textAlign: "center" }}>AI Assistant </h2>
      <div style = {{border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "scroll" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "5px 0", textAlign: msg.sender === "User" ? "right" : "left"}}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
        {isTyping && (
            <div style={{ fontStyle: "italic", color: "gray", margin: "5px 0" }}>
              AI is typing...
            </div>
          )}
        <div ref={messageEndRef} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        style={{ width: "80%", padding: "10px", margintop: "10px" }} 
      />
      < button onClick={sendMessage} style={{ width: "18%", marginLeft: "2%", padding: "10px"}}>
      Send
      </button>
    </div>
  );
}

export default App;