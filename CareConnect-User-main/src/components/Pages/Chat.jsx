import React, { useState, useRef, useEffect } from "react";
import ChatImage from "../assets/Chat.png";
import { getAIResponse } from "../utils/aiService";
import { Send, Trash2, X } from "lucide-react";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(stored);
  }, []);

  // Save messages and auto-scroll
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Send message to AI
  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const aiData = await getAIResponse(message);

      setMessages((prev) => [
        ...prev,
        {
          text: aiData.reply,
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // Doctor Suggestions
      if (aiData.doctors?.length > 0) {
        aiData.doctors.forEach((doctor) => {
          setMessages((prev) => [
            ...prev,
            {
              text: `👨‍⚕️ Dr. ${doctor.name} (${doctor.specialization})
Experience: ${doctor.experience} yrs | Fees: ₹${doctor.fees}`,
              sender: "bot",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ AI service is currently unavailable.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Delete message
  const handleDelete = (index) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  // Clear all chats
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:scale-110 transition-transform"
      >
        <img
          src={ChatImage}
          alt="chat"
          className="w-14 h-14 rounded-full shadow-lg border border-border"
        />
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div
          ref={chatRef}
          className="mt-3 w-80 sm:w-96 bg-card text-card-foreground rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h3 className="font-semibold text-sm">🤖 AI Medical Assistant</h3>
            <div className="flex gap-2">
              <button onClick={handleClearChat}>
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3 bg-background">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                👋 Hi! How can I help you today?
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[75%] text-sm shadow ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[10px] opacity-70 block text-right">
                    {msg.time}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(i)}
                  className="ml-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {isTyping && (
              <div className="text-left">
                <div className="bg-muted text-foreground p-2 rounded-lg text-sm inline-block animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
            <input
              type="text"
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your symptoms..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
