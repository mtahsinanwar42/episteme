import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PasswordInput,
  getPasswordStrength,
} from "@/components/common/PasswordInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useSuccessToast } from "@/hooks/useSuccessToast";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { showSuccessToast } = useSuccessToast();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const doPasswordsMatch =
    formData.confirmPassword !== "" &&
    formData.newPassword === formData.confirmPassword;

  const isFormValid =
    formData.currentPassword.trim() !== "" &&
    formData.newPassword.trim() !== "" &&
    formData.confirmPassword.trim() !== "" &&
    doPasswordsMatch &&
    passwordStrength.score >= 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setIsLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showSuccessToast("Password updated successfully!");
      setTimeout(() => navigate("/"), 500);
    } catch (err: any) {
      setError(err?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative max-w-md w-full">
        <div className="absolute -inset-px bg-linear-to-br from-indigo-300/35 via-sky-200/30 to-emerald-200/25 rounded-3xl blur opacity-70" />
        <div className="relative rounded-3xl border border-border bg-card backdrop-blur-md shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium ">
                Current Password *
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <PasswordInput
              value={formData.newPassword}
              onChange={(e) =>
                handleChange({
                  ...e,
                  target: { ...e.target, name: "newPassword" },
                })
              }
              disabled={isLoading}
              name="newPassword"
              id="newPassword"
            />
            {formData.newPassword && passwordStrength.score < 4 && (
              <p className="text-red-400 text-xs">
                Password is not strong enough.
              </p>
            )}

            <div className="flex flex-col space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium ">
                Confirm New Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-red-400 text-xs">Passwords do not match.</p>
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
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
