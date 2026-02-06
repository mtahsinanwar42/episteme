import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { Input } from "@/components/ui/input";
import {
  getPasswordStrength,
  PasswordInput,
} from "@/components/common/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { useCountries } from "@/hooks/useUsers";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useSuccessToast } from "@/hooks/useSuccessToast";

export default function Register() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const { data: countriesData } = useCountries();

  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^\+?[0-9][0-9\-\s]{6,20}$/;
  const LINKEDIN_REGEX =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    institution: "",
    occupation: "",
    country: "Bangladesh",
    linkedinUrl: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["USER"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSuccessToast } = useSuccessToast();

  const isEmailValid = EMAIL_REGEX.test(formData.email);
  const isPhoneValid = !formData.phone || PHONE_REGEX.test(formData.phone);
  const isLinkedinValid =
    !formData.linkedinUrl || LINKEDIN_REGEX.test(formData.linkedinUrl);
  const passwordStrength = getPasswordStrength(formData.password);
  const isPasswordStrong = passwordStrength.score >= 4;
  const doPasswordsMatch =
    formData.confirmPassword !== "" &&
    formData.password === formData.confirmPassword;

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    isEmailValid &&
    formData.password !== "" &&
    isPasswordStrong &&
    formData.confirmPassword !== "" &&
    doPasswordsMatch &&
    isPhoneValid &&
    isLinkedinValid &&
    formData.country !== "" &&
    formData.institution.trim() !== "" &&
    formData.occupation.trim() !== "" &&
    selectedRoles.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        // Don't allow deselecting if it's the only role
        // if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setIsLoading(true);

    try {
      const { confirmPassword: _, ...submitData } = formData;
      const response = await authService.register({
        ...submitData,
        roles: selectedRoles,
      });

      if (response.success) {
        showSuccessToast("Registration successful! Redirecting to login...");
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative max-w-2xl w-full">
        <div className="absolute -inset-px bg-linear-to-br from-indigo-300/35 via-sky-200/30 to-emerald-200/25 rounded-3xl blur opacity-70" />
        <div className="relative rounded-3xl border border-border bg-card backdrop-blur-md shadow-2xl p-10">
          <LoadingOverlay visible={isLoading} />
          <div className="flex flex-col gap-3 text-center mb-8">
            <p className="text-sm text-foreground tracking-[0.12em] uppercase">
              Join Us
            </p>
            <h1 className="text-4xl font-semibold leading-tight bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium ">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium ">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="text-sm font-medium ">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formData.email && !isEmailValid && (
                <p className="text-red-400 text-xs">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <PasswordInput
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />

            <div className="flex flex-col space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium ">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-red-400 text-xs">Passwords do not match.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-2">
                <label htmlFor="phone" className="text-sm font-medium ">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {formData.phone && !isPhoneValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid phone number.
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium ">
                  Country *
                </label>
                <SearchableSelect
                  value={formData.country}
                  onValueChange={handleCountryChange}
                  options={countriesData?.data || []}
                  placeholder="Select a country"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-2">
                <label htmlFor="institution" className="text-sm font-medium ">
                  Institution *
                </label>
                <Input
                  id="institution"
                  name="institution"
                  type="text"
                  placeholder="University Name"
                  value={formData.institution}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="occupation" className="text-sm font-medium ">
                  Occupation *
                </label>
                <Input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="Student"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="linkedinUrl" className="text-sm font-medium ">
                LinkedIn URL
              </label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="text"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
              {formData.linkedinUrl && !isLinkedinValid && (
                <p className="text-red-400 text-xs">
                  Please enter a valid LinkedIn URL.
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium ">Select Roles *</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="role-user"
                    checked={selectedRoles.includes("USER")}
                    onCheckedChange={() => handleRoleToggle("USER")}
                  />
                  <label
                    htmlFor="role-user"
                    className="text-sm  cursor-pointer"
                  >
                    User
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="role-reviewer"
                    checked={selectedRoles.includes("REVIEWER")}
                    onCheckedChange={() => handleRoleToggle("REVIEWER")}
                  />
                  <label
                    htmlFor="role-reviewer"
                    className="text-sm  cursor-pointer"
                  >
                    Reviewer
                  </label>
                </div>
              </div>
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
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-300 hover:brightness-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
