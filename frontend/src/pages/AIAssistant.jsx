import { useState } from "react";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am SafeShift AI Assistant. Ask me about disaster risk, relocation, safe sites, or alerts.",
    },
  ]);

  const [input, setInput] = useState("");

  const getAnswer = (question) => {
    const text = question.toLowerCase();

    if (text.includes("risk")) {
      return "SafeShift AI currently identifies 7 critical-risk habitations and 11 high-risk habitations in demo mode.";
    }

    if (text.includes("relocation")) {
      return "7 habitations are marked for immediate relocation assessment, while 11 require short-term action planning.";
    }

    if (text.includes("safe") || text.includes("shelter")) {
      return "There are 12 demo safe sites with approximately 8,420 available capacity.";
    }

    if (text.includes("alert")) {
      return "There are 3 recent demo alerts: a new structure detection, a high habitation risk alert, and pending field verification.";
    }

    if (text.includes("flood")) {
      return "Flood-prone areas can be monitored using hazard zones, habitation exposure, population risk, and available safe-site capacity.";
    }

    if (text.includes("help")) {
      return "You can ask about risk areas, relocation priority, safe sites, flood risk, or current alerts.";
    }

    return "I can help you with disaster risk, relocation planning, safe sites, flood monitoring, and alerts.";
  };

  const sendMessage = () => {
    if (input.trim() === "") {
      return;
    }

    const question = input.trim();

    const userMessage = {
      sender: "user",
      text: question,
    };

    const aiMessage = {
      sender: "ai",
      text: getAnswer(question),
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "Chat cleared. How can I help you?",
      },
    ]);
  };

  const useQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="ai-assistant-page">

      <div className="ai-title">
        <div>
          <h2>AI Assistant</h2>
          <p>SafeShift AI disaster risk support</p>
        </div>

        <button onClick={clearChat} className="clear-chat">
          Clear Chat
        </button>
      </div>

      <div className="chat-box">

        <div className="chat-header">
          <div className="ai-avatar">AI</div>

          <div>
            <strong>SafeShift AI</strong>
            <p>● Online</p>
          </div>
        </div>

        <div className="chat-messages">

          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "user"
                  ? "message user-message"
                  : "message ai-message"
              }
            >
              <div className="message-name">
                {message.sender === "user" ? "You" : "SafeShift AI"}
              </div>

              <div className="message-text">
                {message.text}
              </div>
            </div>
          ))}

        </div>

        <div className="quick-questions">

          <button
            onClick={() =>
              useQuestion("What are the current risk areas?")
            }
          >
            Current risk areas
          </button>

          <button
            onClick={() =>
              useQuestion("Which areas need relocation?")
            }
          >
            Relocation priority
          </button>

          <button
            onClick={() =>
              useQuestion("How many safe sites are available?")
            }
          >
            Safe sites
          </button>

          <button
            onClick={() =>
              useQuestion("What are the current alerts?")
            }
          >
            Current alerts
          </button>

        </div>

        <div className="chat-input">

          <input
            type="text"
            placeholder="Ask SafeShift AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            Send
          </button>

        </div>

        
      </div>

      <style>{`

        .ai-assistant-page {
          padding: 25px;
          color: #ffffff;
        }

        .ai-title {
        background: rgba(255, 255, 255, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ai-title h2 {
          margin: 0;
          color: #ffffff;
          font-size: 25px;
          
        }

        .ai-title p {
          margin: 5px 0 0;
          color: #f4f6f8;
          font-size: 13px;
        }

        .clear-chat {
          padding: 9px 16px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .clear-chat:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .ai-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .feature-icon {
          font-size: 25px;
        }

        .feature-card strong {
          color: #ffffff;
          font-size: 14px;
        }

        .feature-card p {
          margin: 4px 0 0;
          color: #b9c2cf;
          font-size: 11px;
        }

        .chat-box {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          overflow: hidden;
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .ai-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2f6df6, #60a5fa);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .chat-header strong {
          color: #ffffff;
        }

        .chat-header p {
          margin: 3px 0 0;
          color: #7be0b1;
          font-size: 11px;
        }

        .chat-messages {
          height: 380px;
          overflow-y: auto;
          padding: 20px;
          background: transparent;
        }

        .message {
          max-width: 70%;
          margin-bottom: 15px;
          padding: 11px 14px;
          border-radius: 10px;
        }

        .ai-message {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e8ecf1;
        }

        .user-message {
          margin-left: auto;
          background: rgba(59, 130, 246, 0.4);
          border: 1px solid rgba(96, 165, 250, 0.4);
          color: #ffffff;
        }

        .message-name {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 5px;
          opacity: 0.7;
        }

        .message-text {
          font-size: 13px;
          line-height: 1.5;
        }

        .quick-questions {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          overflow-x: auto;
        }

        .quick-questions button {
          white-space: nowrap;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
          color: #e8ecf1;
        }

        .quick-questions button:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        .chat-input input {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .chat-input input::placeholder {
          color: #c7ccd4;
        }

        .chat-input button {
          padding: 0 22px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.85);
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        .chat-input button:hover {
          background: #1d4ed8;
        }

        .demo-message {
          padding: 9px;
          text-align: center;
          background: rgba(255, 176, 64, 0.14);
          color: #ffd699;
          font-size: 10px;
          border-top: 1px solid rgba(255, 176, 64, 0.3);
        }

        @media (max-width: 900px) {
          .ai-features {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .ai-assistant-page {
            padding: 15px;
          }

          .ai-features {
            grid-template-columns: 1fr;
          }

          .message {
            max-width: 85%;
          }
        }

      `}</style>

    </div>
  );
}

export default AIAssistant;
