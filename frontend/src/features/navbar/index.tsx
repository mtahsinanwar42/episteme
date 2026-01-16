import { ThemeSwitcher } from "@/components/common/themeSwitcher";
import useAuthStore from "@/stores/authStore";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuthStore();

  // const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  //   textDecoration: isActive ? "underline" : "none",
  //   fontWeight: isActive ? "bold" : "normal",
  // });

  return (
    <nav className="w-full py-1 px-4 bg-accent text-foreground flex justify-end">
      <div className="flex gap-2">
        <Link to="/" className="mx-2 hover:underline">
          Home
        </Link>
        <Link to="/users" className="mx-2 hover:underline">
          Users
        </Link>
        <Link to="/about" className="mx-2 hover:underline">
          About
        </Link>

        <div className="flex items-center gap-4">
          {user?.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm">{user?.user_metadata?.full_name}</span>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
