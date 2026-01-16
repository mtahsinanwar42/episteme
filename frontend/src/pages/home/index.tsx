import useAuthStore from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
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
              <strong>Name:</strong> {user?.user_metadata?.full_name || "N/A"}
            </p>
            <p className="mb-2" style={{ color: "var(--color-text)" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ color: "var(--color-text)" }}>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>

          {user?.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
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

export default Dashboard;
