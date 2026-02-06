import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@/stores/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setLoading, setToken, setUser } from "@/stores/authSlice";
import { authService } from "@/services/authService";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import Cookies from "js-cookie";

function Login() {
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.token) {
        Cookies.set("token", response.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        await dispatch(setToken(response.token));

        // Fetch user details
        const userDetailsResponse = await authService.getLoggedInUserDetails();
        if (userDetailsResponse.success && userDetailsResponse.data) {
          dispatch(setUser(userDetailsResponse.data));
          dispatch(setLoading(false));
          navigate("/");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.fromLogout) {
      dispatch(setUser(null));
    }
  }, [location]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative max-w-lg w-full">
        <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-300/35 via-sky-200/30 to-emerald-200/25 rounded-3xl blur opacity-70" />
        <div className="relative rounded-3xl border border-border bg-card backdrop-blur-md shadow-2xl p-10 ">
          <LoadingOverlay visible={isLoading} />
          <div className="flex flex-col gap-3 text-center mb-8">
            <p className="text-sm tracking-[0.12em] uppercase">Welcome back</p>
            <h1 className="text-4xl font-semibold leading-tight bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Sign in to Episteme
            </h1>
            <p>Access your dashboard and manage your account</p>
          </div>

          <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="email"
                className="text-left text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label
                htmlFor="password"
                className="text-left text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md text-sm border border-red-500/30 bg-red-200/40 text-orange-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-white! shadow-lg hover:brightness-105"
              style={{
                background:
                  "linear-gradient(120deg, #646cff, #7f84ff 50%, #4f46e5)",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              New here?{" "}
              <Link
                to="/register"
                className="text-indigo-300 hover:brightness-90"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
