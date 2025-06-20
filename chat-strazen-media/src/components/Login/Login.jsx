import "./Login.styles.css";
import iconGoogle from "../../assets/icon-google.png";
import elipse from "../../assets/ellipse-login.png";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = registerMode ? "register" : "login";

      const headers =
        endpoint === "login"
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : { "Content-Type": "application/json" };

      const body =
        endpoint === "login"
          ? new URLSearchParams({ username: email, password })
          : JSON.stringify({ email, username: email, password });

      const res = await fetch(`http://localhost:8000/auth/${endpoint}`, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();

      const token = data.access_token ?? null;
      if (!token) throw new Error("Token not found");

      localStorage.setItem("accessToken", token);

      const userRes = await fetch("http://localhost:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userRes.json();
      localStorage.setItem("userProfile", JSON.stringify(userData));
      onLoginSuccess(userData);
      navigate("/");
    } catch (err) {
      setError(
        registerMode
          ? "Registration failed. Email may already be in use."
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
          <h1 className="heading">Welcome to Starzen</h1>
          <p className="text-login">
            {registerMode ? "Create an account to start your journey" : "Sign in to connect with expert specialists"}
          </p>

          <form onSubmit={handleSubmit} className="form-login">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={registerMode ? "new-password" : "current-password"}
              required
            />
            <button type="submit" className="btn-email-login">
              {registerMode ? "Register" : "Login"}
            </button>
          </form>

          <button
            className="btn-toggle-mode"
            onClick={() => setRegisterMode((prev) => !prev)}
          >
            {registerMode ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>

          <p className="text-login">
            By {registerMode ? "registering" : "signing in"}, you agree to our <br />
            Terms of Service and Privacy Policy
          </p>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </section>
  );
}
