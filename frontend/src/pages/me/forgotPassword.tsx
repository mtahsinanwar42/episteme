import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { useSuccessToast } from "@/hooks/useSuccessToast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSuccessToast } = useSuccessToast();

  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const isEmailValid = EMAIL_REGEX.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        showSuccessToast("A Password Reset URL has been sent to your email.");
        navigate("/login");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageTitle title="Forgot Password" />
      <PageSubTitle text="Enter your email to receive a password reset link" />

      <div className="h-full flex items-center justify-center">
        <div className="relative max-w-md w-full">
          <LoadingOverlay visible={isLoading} />
          <div className="absolute -inset-px bg-linear-to-br from-indigo-300/35 via-sky-200/30 to-emerald-200/25 rounded-3xl blur opacity-70" />
          <div className="relative rounded-3xl border border-border bg-card backdrop-blur-md shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-sm font-medium ">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {email && !isEmailValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid email address.
                  </p>
                )}
              </div>
              {error && (
                <div className="p-3 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full text-foreground! shadow-lg enabled:hover:brightness-105"
                style={{
                  background:
                    "linear-gradient(120deg, #646cff, #7f84ff 50%, #4f46e5)",
                }}
                disabled={!isEmailValid || isLoading}
              >
                Send Reset Link
              </Button>
              {isLoading && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
