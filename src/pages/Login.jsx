import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const PHONE_REGEX = /^[0-9]{10}$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!PHONE_REGEX.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", { phone });
      setDevOtp(res.data.devOtp || "");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });

      if (res.data.user.role !== "admin") {
        setError("This phone number is not registered as an admin account.");
        return;
      }

      login(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,_white_1px,_transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />

      <div className="absolute right-4 top-4">
        <ThemeToggle className="bg-white/10 text-white hover:bg-white/20 hover:text-white" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="text-center text-white">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-glow backdrop-blur">
            🥛
          </span>
          <h1 className="text-2xl font-bold">Fresh Dairy Admin</h1>
          <p className="mt-1 text-sm text-white/70">Sign in with your admin phone number.</p>
        </div>

        <div className="card p-6">
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-muted">
                  Admin Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="input"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-ink-muted">
                  OTP sent to <span className="font-medium text-ink">{phone}</span>{" "}
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="font-medium text-brand-500 underline underline-offset-2"
                  >
                    change
                  </button>
                </p>
                {devOtp && (
                  <p className="mt-2 rounded-lg bg-gold-100 px-3 py-1.5 text-xs text-gold-700">
                    DEV MODE — your OTP is <b>{devOtp}</b>
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink-muted">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP"
                  className="input text-center text-lg tracking-[0.3em]"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
