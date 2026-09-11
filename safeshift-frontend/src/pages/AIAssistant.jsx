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

      <div className="ai-features">

        <div className="feature-card">
          <div className="feature-icon">⚠️</div>
          <div>
            <strong>Risk Analysis</strong>
            <p>Analyze disaster risks</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🚨</div>
          <div>
            <strong>Relocation</strong>
            <p>Plan relocation priorities</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📍</div>
          <div>
            <strong>Safe Sites</strong>
            <p>Find available safe sites</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔔</div>
          <div>
            <strong>Alerts</strong>
            <p>Understand system alerts</p>
          </div>
        </div>

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

        <div className="demo-message">
          ⚠️ Demo AI Mode — Backend AI integration will be connected later.
        </div>

      </div>

      <style>{`

        .ai-assistant-page {
          padding: 25px;
        }

        .ai-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ai-title h2 {
          margin: 0;
          color: #172033;
          font-size: 25px;
        }

        .ai-title p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .clear-chat {
          padding: 9px 16px;
          border: 1px solid #cbd5e1;
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .clear-chat:hover {
          background: #f8fafc;
        }

        .ai-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .feature-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature-icon {
          font-size: 25px;
        }

        .feature-card strong {
          color: #1e293b;
          font-size: 14px;
        }

        .feature-card p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .chat-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .ai-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #172033;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          font-weight: bold;
        }

        .chat-header strong {
          color: #172033;
        }

        .chat-header p {
          margin: 3px 0 0;
          color: #16a34a;
          font-size: 11px;
        }

        .chat-messages {
          height: 380px;
          overflow-y: auto;
          padding: 20px;
          background: #ffffff;
        }

        .message {
          max-width: 70%;
          margin-bottom: 15px;
          padding: 11px 14px;
          border-radius: 10px;
        }

        .ai-message {
          background: #f1f5f9;
          color: #334155;
        }

        .user-message {
          margin-left: auto;
          background: #172033;
          color: white;
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
          border-top: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .quick-questions button {
          white-space: nowrap;
          padding: 8px 12px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
          color: #475569;
        }

        .quick-questions button:hover {
          background: #f1f5f9;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          border-top: 1px solid #e2e8f0;
        }

        .chat-input input {
          flex: 1;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
        }

        .chat-input button {
          padding: 0 22px;
          border: none;
          border-radius: 8px;
          background: #172033;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        .chat-input button:hover {
          background: #0f172a;
        }

        .demo-message {
          padding: 9px;
          text-align: center;
          background: #fffbeb;
          color: #92400e;
          font-size: 10px;
          border-top: 1px solid #fef3c7;
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