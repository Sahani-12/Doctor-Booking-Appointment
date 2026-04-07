import React, { useState, useRef, useEffect } from "react";
import ChatImage from "../assets/Chat.png";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(stored);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); // ✅ auto scroll
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      text: message,
      time: new Date().toLocaleTimeString(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    // Fake bot reply (optional)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Thanks! We will help you shortly 😊",
          time: new Date().toLocaleTimeString(),
          sender: "bot",
        },
      ]);
    }, 800);
  };

  const handleDelete = (index) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleClickOutside = (e) => {
    if (chatRef.current && !chatRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}>
        <img
          src={ChatImage}
          alt="chat"
          className="w-14 h-14 rounded-full shadow-lg"
        />
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div
          ref={chatRef}
          className="mt-2 w-80 bg-white rounded-xl shadow-lg border flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Help Center</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="h-60 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                👋 Hi! How can we help you?
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[70%] text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] opacity-70">
                    {msg.time}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(i)}
                  className="ml-1 text-xs text-red-400"
                >
                  ❌
                </button>
              </div>
            ))}

            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="flex p-2 border-t">
            <input
              type="text"
              className="flex-1 border rounded-md px-2 py-1 text-sm"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-500 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;