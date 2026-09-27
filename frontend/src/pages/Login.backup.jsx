import { useState } from "react";

const AUTH_API_URL =
  "https://safeshift-ai-backend.onrender.com/api/auth";

function Login({ onLogin }) {
  const [mode, setMode] = useState("signin");
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

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "signup" ? "signup" : "login";

      const response = await fetch(
        `${AUTH_API_URL}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error ||
            "Authentication failed. Please try again."
        );
        return;
      }

      localStorage.setItem(
        "safeshift_user",
        data.username || username.trim()
      );

      onLogin(data.username || username.trim());

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the SafeShift AI server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* BACKGROUND STRUCTURE */}
      <div className="background-grid"></div>
      <div className="background-glow"></div>

      {/* LEFT INFORMATION PANEL */}
      <section className="login-intro">

        <div className="brand">
          <div className="brand-line"></div>

          <div>
            <div className="brand-name">
              SAFESHIFT
            </div>

            <div className="brand-ai">
              AI
            </div>
          </div>
        </div>

        <div className="intro-content">

          <div className="eyebrow">
            INTELLIGENT DISASTER MANAGEMENT
          </div>

          <h1>
            Disaster Risk
            <br />
            & Relocation
            <br />
            <span>Decision System</span>
          </h1>

          <p>
            A centralized intelligence platform for
            identifying hazard zones, assessing vulnerable
            habitations and planning safer relocation.
          </p>

          <div className="system-status">

            <span className="status-dot"></span>

            <div>
              <strong>System Operational</strong>
              <small>
                AI & GIS monitoring services active
              </small>
            </div>

          </div>

        </div>

        <div className="intro-footer">

          <span>INDIA</span>

          <span className="footer-divider"></span>

          <span>DISASTER MANAGEMENT</span>

          <span className="footer-divider"></span>

          <span>SAFESHIFT AI</span>

        </div>

      </section>


      {/* LOGIN PANEL */}
      <section className="login-panel">

        <div className="login-box">

          <div className="panel-top">

            <div>
              <span className="panel-label">
                SECURE ACCESS
              </span>

              <h2>
                {mode === "signin"
                  ? "Welcome back"
                  : "Create account"}
              </h2>
            </div>

            <div className="system-code">
              SS / 01
            </div>

          </div>


          <p className="panel-description">
            {mode === "signin"
              ? "Sign in to access the SafeShift AI command dashboard."
              : "Create an account to access the SafeShift AI platform."}
          </p>


          {/* MODE SWITCH */}
          <div className="auth-switch">

            <button
              type="button"
              className={
                mode === "signin"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => switchMode("signin")}
            >
              Sign In
            </button>

            <button
              type="button"
              className={
                mode === "signup"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => switchMode("signup")}
            >
              Create Account
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* USERNAME */}
            <div className="field">

              <label>
                USERNAME
              </label>

              <div className="input-wrapper">

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="field">

              <label>
                PASSWORD
              </label>

              <div className="input-wrapper">

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}
            {mode === "signup" && (
              <div className="field">

                <label>
                  CONFIRM PASSWORD
                </label>

                <div className="input-wrapper">

                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                </div>

              </div>
            )}


            {/* ERROR */}
            {error && (
              <div className="login-error">
                <span></span>
                {error}
              </div>
            )}


            {/* BUTTON */}
            <button
              className="submit-button"
              type="submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? mode === "signup"
                    ? "Creating account..."
                    : "Authenticating..."
                  : mode === "signup"
                  ? "Create Account"
                  : "Sign In"}
              </span>

              {!loading && (
                <span className="button-arrow">
                  →
                </span>
              )}

            </button>

          </form>


          {/* BOTTOM */}
          <div className="login-bottom">

            {mode === "signin" ? (
              <>
                <span>
                  New to SafeShift AI?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("signup")
                  }
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                <span>
                  Already registered?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("signin")
                  }
                >
                  Sign in
                </button>
              </>
            )}

          </div>


          <div className="security-note">

            <span className="security-line"></span>

            <span>
              AUTHENTICATED SYSTEM ACCESS
            </span>

            <span className="security-line"></span>

          </div>

        </div>

      </section>


      <style>{`

        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              115deg,
              #0b1220 0%,
              #111c2e 45%,
              #edf2f7 45.1%,
              #f8fafc 100%
            );
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* ---------------- BACKGROUND ---------------- */

        .background-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.12;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.15) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.15) 1px,
              transparent 1px
            );

          background-size:
            45px 45px;

          width: 55%;
        }


        .background-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          left: -250px;
          bottom: -280px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(51, 132, 255, 0.16),
              transparent 70%
            );

          pointer-events: none;
        }


        /* ---------------- LEFT SIDE ---------------- */

        .login-intro {
          width: 53%;
          min-height: 100vh;
          position: relative;
          z-index: 2;

          padding:
            55px
            70px
            42px
            8%;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          color: white;
        }


        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }


        .brand-line {
          width: 4px;
          height: 38px;

          background: #65b5ff;
        }


        .brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 4px;
        }


        .brand-ai {
          margin-top: 2px;
          font-size: 10px;
          letter-spacing: 5px;
          color: #8fbce5;
        }


        .intro-content {
          max-width: 600px;
          margin-top: -30px;
        }


        .eyebrow {
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: 700;
          color: #8fbce5;
          margin-bottom: 24px;
        }


        .intro-content h1 {
          margin: 0;

          font-size:
            clamp(42px, 4.2vw, 68px);

          line-height: 0.98;

          letter-spacing: -2px;

          font-weight: 700;
        }


        .intro-content h1 span {
          color: #78bfff;
        }


        .intro-content p {
          max-width: 500px;

          margin-top: 30px;

          color: #a9b8cb;

          font-size: 15px;

          line-height: 1.8;
        }


        .system-status {
          margin-top: 38px;

          display: flex;
          align-items: center;

          gap: 13px;

          width: fit-content;

          padding:
            11px
            16px;

          border:
            1px solid
            rgba(255,255,255,0.12);

          background:
            rgba(255,255,255,0.035);
        }


        .status-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #4ade80;

          box-shadow:
            0 0 0 4px
            rgba(74,222,128,0.1);
        }


        .system-status strong {
          display: block;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 1px;
        }


        .system-status small {
          display: block;

          margin-top: 3px;

          color: #7f91a7;

          font-size: 10px;
        }


        .intro-footer {
          display: flex;
          align-items: center;
          gap: 13px;

          font-size: 9px;

          letter-spacing: 1.5px;

          color: #71839a;
        }


        .footer-divider {
          width: 25px;
          height: 1px;
          background: #405067;
        }


        /* ---------------- LOGIN PANEL ---------------- */

        .login-panel {
          width: 47%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 50px;

          position: relative;
          z-index: 3;
        }


        .login-box {
          width: 100%;
          max-width: 465px;

          padding: 50px;

          background: rgba(255,255,255,0.95);

          border:
            1px solid
            rgba(15,23,42,0.07);

          box-shadow:
            0 30px 80px
            rgba(15,23,42,0.13);
        }


        .panel-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }


        .panel-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #64748b;
        }


        .panel-top h2 {
          margin:
            9px
            0
            0;

          color: #101827;

          font-size: 30px;

          letter-spacing: -0.8px;
        }


        .system-code {
          color: #94a3b8;
          font-size: 10px;
          letter-spacing: 2px;
        }


        .panel-description {
          margin:
            13px
            0
            30px;

          color: #64748b;

          font-size: 12px;

          line-height: 1.7;
        }


        /* ---------------- TABS ---------------- */

        .auth-switch {
          display: flex;

          border-bottom:
            1px solid #e2e8f0;

          margin-bottom: 28px;
        }


        .auth-tab {
          position: relative;

          padding:
            0
            0
            13px;

          margin-right: 30px;

          border: none;

          background: none;

          color: #94a3b8;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }


        .auth-tab.active {
          color: #172033;
        }


        .auth-tab.active::after {
          content: "";

          position: absolute;

          left: 0;
          bottom: -1px;

          width: 100%;
          height: 2px;

          background: #172033;
        }


        /* ---------------- FORM ---------------- */

        .field {
          margin-bottom: 21px;
        }


        .field label {
          display: block;

          margin-bottom: 8px;

          color: #475569;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }


        .input-wrapper {
          position: relative;
        }


        .input-wrapper input {
          width: 100%;

          height: 49px;

          padding:
            0
            15px;

          border:
            1px solid
            #d8dee7;

          background: #fafbfc;

          color: #172033;

          font-size: 13px;

          outline: none;

          transition:
            border 0.2s,
            background 0.2s,
            box-shadow 0.2s;
        }


        .input-wrapper input::placeholder {
          color: #a4afbd;
        }


        .input-wrapper input:hover {
          border-color: #b7c2d0;
        }


        .input-wrapper input:focus {
          background: white;

          border-color: #172033;

          box-shadow:
            0 0 0 3px
            rgba(23,32,51,0.05);
        }


        /* ---------------- ERROR ---------------- */

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;

          margin:
            -4px
            0
            18px;

          padding:
            10px
            12px;

          background: #fff7f7;

          border-left:
            2px solid
            #dc2626;

          color: #b91c1c;

          font-size: 11px;
        }


        .login-error span {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #dc2626;
        }


        /* ---------------- BUTTON ---------------- */

        .submit-button {
          width: 100%;

          height: 52px;

          margin-top: 6px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding:
            0
            17px
            0
            20px;

          border: none;

          background: #172033;

          color: white;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.8px;

          cursor: pointer;

          transition:
            background 0.2s,
            transform 0.2s;
        }


        .submit-button:hover {
          background: #0d1525;

          transform:
            translateY(-1px);
        }


        .submit-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }


        .button-arrow {
          font-size: 20px;

          font-weight: 300;

          transition:
            transform 0.2s;
        }


        .submit-button:hover .button-arrow {
          transform:
            translateX(4px);
        }


        /* ---------------- BOTTOM ---------------- */

        .login-bottom {
          display: flex;

          justify-content: center;

          gap: 5px;

          margin-top: 25px;

          color: #94a3b8;

          font-size: 11px;
        }


        .login-bottom button {
          border: none;

          background: none;

          padding: 0;

          color: #172033;

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;
        }


        .security-note {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          margin-top: 32px;

          color: #b0bac6;

          font-size: 7px;

          letter-spacing: 1.5px;
        }


        .security-line {
          width: 35px;
          height: 1px;

          background: #e5e9ee;
        }


        /* ---------------- RESPONSIVE ---------------- */

        @media (max-width: 900px) {

          .login-page {
            background:
              #f8fafc;
          }

          .login-intro {
            display: none;
          }

          .login-panel {
            width: 100%;
            padding: 25px;
          }

          .login-box {
            max-width: 450px;
          }
        }


        @media (max-width: 500px) {

          .login-panel {
            padding: 15px;
          }

          .login-box {
            padding: 30px 24px;
          }

          .panel-top h2 {
            font-size: 25px;
          }
        }

      `}</style>
    </div>
  );
}

export default Login;
