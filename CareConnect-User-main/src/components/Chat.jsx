import React, { useState, useRef, useEffect } from "react";
import ChatImage from "../assets/Chat.png";
import { getAIResponse } from "../utils/aiService";

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
  }, [messages, isTyping]);

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
      time: new Date().toLocaleTimeString(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const aiData = await getAIResponse(message);

      const botMessage = {
        text: aiData.reply,
        time: new Date().toLocaleTimeString(),
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);

      // Doctor Suggestions
      if (aiData.doctors && aiData.doctors.length > 0) {
        aiData.doctors.forEach((doctor) => {
          setMessages((prev) => [
            ...prev,
            {
              text: `👨‍⚕️ Dr. ${doctor.name} (${doctor.specialization})
Experience: ${doctor.experience} yrs | Fees: ₹${doctor.fees}`,
              time: new Date().toLocaleTimeString(),
              sender: "bot",
            },
          ]);
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ AI service is currently unavailable.",
          time: new Date().toLocaleTimeString(),
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDelete = (index) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}>
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
          className="mt-2 w-80 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-500 text-white rounded-t-xl">
            <h3 className="font-semibold">🤖 AI Medical Assistant</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="h-60 overflow-y-auto p-3 space-y-2 bg-white dark:bg-gray-900">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[10px] opacity-70 block text-right">
                    {msg.time}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(i)}
                  className="ml-1 text-xs text-red-400 hover:text-red-600"
                >
                  ❌
                </button>
              </div>
            ))}

            {isTyping && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI is typing...
              </p>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="flex p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <input
              type="text"
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md px-2 py-1 text-sm focus:outline-none"
              placeholder="Describe your symptoms..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 rounded"
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