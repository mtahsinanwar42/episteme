import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PasswordInput,
  getPasswordStrength,
} from "@/components/common/PasswordInput";
import { authService } from "@/services/authService";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = getPasswordStrength(password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(resetToken!, password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError("Failed to reset password. Try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageTitle title="Reset Password" />
      <PageSubTitle text="Enter your new password below" />

      <div className="h-full flex items-center justify-center">
        <div className="relative max-w-md w-full">
          <LoadingOverlay visible={isLoading} />
          <div className="absolute -inset-px bg-linear-to-br from-indigo-300/35 via-sky-200/30 to-emerald-200/25 rounded-3xl blur opacity-70" />
          <div className="relative rounded-3xl border border-border bg-card backdrop-blur-md shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                name="password"
                id="password"
              />
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium "
                >
                  Confirm New Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs">
                    Passwords do not match.
                  </p>
                )}
              </div>
              {password && passwordStrength.score < 4 && (
                <div className="text-red-400 text-xs">
                  Password is not strong enough.
                </div>
              )}
              {error && (
                <div className="p-3 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-md text-sm border border-green-500/30 bg-green-500/10 text-green-800">
                  Password reset successful! Redirecting to login...
                </div>
              )}
              <Button
                type="submit"
                className="w-full text-foreground! shadow-lg enabled:hover:brightness-105"
                style={{
                  background:
                    "linear-gradient(120deg, #646cff, #7f84ff 50%, #4f46e5)",
                }}
                disabled={
                  !password.trim() || !confirmPassword.trim() || isLoading
                }
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
