import "./Login.styles.css";
import elipse from "../../assets/ellipse-login.png";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // якщо реєстрація — створити акаунт
      if (registerMode) {
        const registerRes = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        if (!registerRes.ok) {
          const errText = await registerRes.text();
          throw new Error(`Registration failed: ${errText}`);
        }
      }

      // логін у будь-якому випадку
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!loginRes.ok) {
        const errText = await loginRes.text();
        throw new Error(`Login failed: ${errText}`);
      }

      const loginData = await loginRes.json();
      const token = loginData.access_token;
      if (!token) throw new Error("Token not found");

      localStorage.setItem("accessToken", token);

      const userRes = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await userRes.json();
      localStorage.setItem("userProfile", JSON.stringify(userData));

      onLoginSuccess(userData);
      navigate("/");
    } catch (err) {
      console.error("❌ Auth error:", err);
      setError(
        registerMode
          ? "Registration failed. Email or username may already be in use."
          : "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <section className="container-login">
      <div className="container-login-all">
        <div className="frame"></div>

        <div className="welcome">
          <div className="elipse-login">
            <img className="elipse-img" src={elipse} alt="elipse" />
          </div>

          <div className="heading-container">
            <h1 className="heading">Welcome to Starzen</h1>

            <p className="text-login">
              {registerMode
                ? "Create an account to start your journey"
                : "Sign in to connect with expert specialists"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {registerMode && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="login-form__input"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="login-form__input"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={registerMode ? "new-password" : "current-password"}
              required
              className="login-form__input"
            />

            <button type="submit" className="btn-email-login">
              {registerMode ? "Register" : "Login"}
            </button>
          </form>

          <div>
            <button
              className="btn-toggle-mode"
              onClick={() => setRegisterMode((prev) => !prev)}
            >
              {registerMode
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>

            <p className="text-login">
              By {registerMode ? "registering" : "signing in"}, you agree to our{" "}
              <br />
              Terms of Service and Privacy Policy
            </p>

            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
