import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === "artist" ? "/studio" : "/library");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">M</span>
          <span>Musify</span>
        </div>
        <h1 className="auth-heading">Cut your first track</h1>
        <p className="auth-sub">Create an account to listen, or to upload as an artist.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={update("username")} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={update("password")} required />
          </div>

          <div className="field">
            <label>I am joining as</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-option ${form.role === "user" ? "selected" : ""}`}
                onClick={() => setForm((f) => ({ ...f, role: "user" }))}
              >
                Listener
              </button>
              <button
                type="button"
                className={`role-option ${form.role === "artist" ? "selected" : ""}`}
                onClick={() => setForm((f) => ({ ...f, role: "artist" }))}
              >
                Artist
              </button>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
