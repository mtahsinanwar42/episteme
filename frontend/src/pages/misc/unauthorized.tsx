import { Button } from "@/components/ui/button";
import { logout } from "@/stores/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    dispatch(logout());
    navigate("/login", {
      state: { fromLogout: true },
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-96 h-96 mb-8">
        <img
          src="/assets/images/unauthorized_access.png"
          alt="Unauthorized"
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-5xl! font-bold bg-linear-to-b from-gray-100 to-red-400 text-transparent bg-clip-text">
        403
      </h1>
      <h2 className="font-bold mb-2">Forbidden</h2>

      <p className="text-center text-lg">
        Sorry, you do not have permission to view this page.
      </p>
      <p className="text-center text-lg mb-4">
        Please login with the correct credentials.
      </p>

      <Button onClick={handleGoToLogin}>Go To Login</Button>
    </div>
  );
}
