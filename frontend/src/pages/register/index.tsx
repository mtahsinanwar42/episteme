import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
// import { fileService } from "@/services/fileService";
// import { FileTypeEnum } from "@/models/file";

export default function Register() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    institution: "",
    occupation: "",
    country: "",
    linkedinUrl: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["USER"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.register({
        ...formData,
        roles: selectedRoles,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="password" className="text-sm font-medium ">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={handleChange}
              />
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
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium ">
                  Country *
                </label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Bangladesh"
                  value={formData.country}
                  onChange={handleChange}
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
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium ">Select Roles</label>
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
              <p className="text-xs">
                Select at least one role for your account
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md text-sm border border-green-500/30 bg-green-500/10 text-green-800">
                Registration successful! Redirecting to login...
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-foreground! shadow-lg hover:brightness-105"
              style={{
                background:
                  "linear-gradient(120deg, #646cff, #7f84ff 50%, #4f46e5)",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create"}
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
