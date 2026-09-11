import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter username and password");
      return;
    }

    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          🛡️
        </div>

        <h1>SafeShift AI</h1>

        <p className="login-description">
          Disaster Risk & Relocation Decision Support System
        </p>

        <form onSubmit={handleSubmit}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Sign In
          </button>

        </form>

        <div className="login-demo">
          <strong>Prototype Login</strong>
          <p>
            Enter any username and password to access the dashboard.
          </p>
        </div>

        <div className="login-footer">
          SafeShift AI • Disaster Management System
        </div>

      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f1f5f9;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          width: 400px;
          max-width: 100%;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-sizing: border-box;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.10);
        }

        .login-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #172033;
          color: white;
          border-radius: 15px;
          font-size: 30px;
        }

        .login-card h1 {
          margin: 0;
          text-align: center;
          color: #172033;
          font-size: 28px;
        }

        .login-description {
          text-align: center;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin: 8px 0 28px;
        }

        .login-card label {
          display: block;
          margin: 16px 0 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
        }

        .login-card input {
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .login-card input:focus {
          border-color: #64748b;
        }

        .login-card form button {
          width: 100%;
          margin-top: 25px;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #172033;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-card form button:hover {
          background: #0f172a;
        }

        .login-demo {
          margin-top: 20px;
          padding: 12px;
          border-radius: 8px;
          background: #fffbeb;
          text-align: center;
        }

        .login-demo strong {
          color: #92400e;
          font-size: 12px;
        }

        .login-demo p {
          margin: 5px 0 0;
          color: #a16207;
          font-size: 11px;
        }

        .login-footer {
          margin-top: 22px;
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 28px 22px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;