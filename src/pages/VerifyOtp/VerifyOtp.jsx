import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast/ToastContext";
import { resendOtp } from "../../api/auth.api";
import "../../styles/auth.css";

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const { completeVerification } = useAuth();
    const { showToast } = useToast();

    const [email] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const user = await completeVerification({ email, otp });
            showToast("Email verified — welcome to Musify!", { type: "success" });
            navigate(user.role === "artist" ? "/studio" : "/library");
        } catch (err) {
            setError(err.message || "Invalid or expired code");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendOtp({ email, purpose: "verify-email" });
            showToast("A new code has been sent.", { type: "success" });
        } catch (err) {
            showToast(err.message || "Could not resend code", { type: "error" });
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div className="auth-screen">
                <div className="auth-card">
                    <h1 className="auth-heading">No account to verify</h1>
                    <p className="auth-sub">Start from the sign-up page to get a verification code.</p>
                    <Link to="/register" className="btn btn-primary auth-submit" style={{ textAlign: "center" }}>
                        Go to sign up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-screen">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="auth-brand-mark">M</span>
                    <span>Musify</span>
                </div>
                <h1 className="auth-heading">Verify your email</h1>
                <p className="auth-sub">Enter the 6-digit code sent to {email}.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="otp">Verification code</label>
                        <input
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button className="btn btn-primary auth-submit" type="submit" disabled={submitting || otp.length !== 6}>
                        {submitting ? "Verifying…" : "Verify email"}
                    </button>
                </form>

                <p className="auth-footer">
                    Didn't get a code?{" "}
                    <button type="button" className="auth-link-button" onClick={handleResend} disabled={resending}>
                        {resending ? "Sending…" : "Resend code"}
                    </button>
                </p>
            </div>
        </div>
    );
}