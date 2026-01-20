import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/stores/authSlice";
import { type RootState } from "@/stores/store";

function Home() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
        <div
          className="p-6 rounded-lg shadow-lg mb-6"
          style={{ border: "2px solid var(--color-primary)" }}
        >
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Dashboard
          </h1>

          <div className="mb-6">
            <p className="mb-2" style={{ color: "var(--color-text)" }}>
              <strong>Name:</strong> {user?.firstName || "N/A"}{" "}
              {user?.lastName || "N/A"}
            </p>
            <p className="mb-2" style={{ color: "var(--color-text)" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ color: "var(--color-text)" }}>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>

          {user?.photoFilePath && (
            <img
              src={user.photoFilePath}
              alt="Profile"
              className="w-20 h-20 rounded-full mb-4"
            />
          )}

          <button
            onClick={handleSignOut}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
