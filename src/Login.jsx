import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!data.get("email") || !data.get("password")) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status})`
        );
      }
      if (!result)
        throw new Error("Cannot reach the login service. Please start the backend.");
      if (!response.ok || !result.success)
        throw new Error(result.message || "Login failed");
      const storage = data.get("remember") ? localStorage : sessionStorage;
      storage.setItem("mmw-auth-token", result.data.token);
      storage.setItem("mmw-auth-user", JSON.stringify(result.data.user));
      onLogin(result.data.user);
    } catch (problem) {
      setError(
        problem.message === "Failed to fetch"
          ? "Cannot reach server. Run 'npm run server' to start the backend."
          : problem.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-page-new">
      {Array.from({ length: 270 }, (_, i) => (
        <span key={i} />
      ))}
      <div className="signin">
        <div className="signin-content">
          <div className="logo-circle">
            <img src="/mmw-logo.png" alt="Admin" />
          </div>
          <h2>Dashboard Login</h2>
          <form className="form" onSubmit={submit}>
            <div className="inputBx">
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
              />
              <i>Email</i>
            </div>
            <div className="inputBx">
              <input
                type={show ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
              />
              <i>Password</i>
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShow(!show)}
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="login-error-new">{error}</p>}
            <div className="links">
              <a href="#">Forgot Password</a>
            </div>
            <div className="inputBx">
              <input
                type="submit"
                value={loading ? "Signing in..." : "Login"}
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
