import { useState } from "react";

// Points at the auth_bp blueprint registered in api_server.py
// (same host/port as ALERTS_API_URL in FieldReports.jsx).
const AUTH_API_URL = "http://localhost:8000/api/auth";

function Login({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username.trim() === "" || password.trim() === "") {
      setError("Please enter username and password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "signup" : "login";
      const response = await fetch(`${AUTH_API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("safeshift_user", data.username);
      onLogin(data.username);
    } catch (err) {
      setError("Could not reach the authentication server. Is api_server.py running?");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">🛡️</div>

        <h1>SafeShift AI</h1>

        <p className="login-description">
          Disaster Risk & Relocation Decision Support System
        </p>

        <div className="login-tabs">
          <button
            type="button"
            className={mode === "signin" ? "tab active" : "tab"}
            onClick={() => switchMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "tab active" : "tab"}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder={mode === "signup" ? "Create a password" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {mode === "signup" && (
            <>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading
              ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
              : mode === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>

        </form>

        <div className="login-switch">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("signin")}>
                Sign in
              </button>
            </>
          )}
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
          background: radial-gradient(circle at top, #1e293b, #0b1120 70%);
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          width: 400px;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          padding: 40px;
          border-radius: 18px;
          box-sizing: border-box;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .login-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #172033);
          color: white;
          border-radius: 16px;
          font-size: 30px;
        }

        .login-card h1 {
          margin: 0;
          text-align: center;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
        }

        .login-description {
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
          margin: 8px 0 26px;
        }

        .login-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 22px;
        }

        .login-tabs .tab {
          flex: 1;
          padding: 9px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
        }

        .login-tabs .tab.active {
          background: #3b82f6;
          color: white;
        }

        .login-card label {
          display: block;
          margin: 14px 0 7px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .login-card input {
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .login-card input::placeholder {
          color: #64748b;
        }

        .login-card input:focus {
          border-color: #3b82f6;
        }

        .login-error {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          font-size: 12px;
        }

        .login-card form button[type="submit"] {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-card form button[type="submit"]:hover {
          background: #2563eb;
        }

        .login-card form button[type="submit"]:disabled {
          background: #475569;
          cursor: not-allowed;
        }

        .login-switch {
          margin-top: 18px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }

        .login-switch button {
          background: none;
          border: none;
          color: #93c5fd;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
        }

        .login-footer {
          margin-top: 22px;
          text-align: center;
          color: #64748b;
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
