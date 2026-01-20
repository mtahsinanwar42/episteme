import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@/stores/store";
import { NavItem, type NavItemConfig } from "@/components/common/NavItem";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/stores/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { UserRole } from "@/models/user";

const navItems: NavItemConfig[] = [
  {
    label: "Resources",
    children: [
      {
        label: "Users",
        href: "/users",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "Documentation",
        href: "/docs",
        visibleTo: "ALL",
      },
      {
        label: "Blog",
        href: "/blog",
        visibleTo: "ALL",
      },
    ],
    visibleTo: "ALL",
  },
  {
    label: "Users",
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Conferences",
    href: "/conferences",
  },
  {
    label: "Trainings",
    href: "/trainings",
  },
  {
    label: "Announcements",
    href: "/announcements",
  },
  {
    label: "Blogs",
    href: "/blogs",
  },
  {
    label: "About",
    children: [
      {
        label: "Mission & Vision",
        href: "/about/mission",
      },
      {
        label: "Ethics",
        href: "/about/ethics",
      },
      {
        label: "Sustainability",
        href: "/about/sustainability",
      },
      {
        label: "Executive Committee",
        href: "/about/executive",
      },
      {
        label: "Policies",
        href: "/about/policies",
      },
      {
        label: "Career",
        href: "/about/career",
      },
      {
        label: "Contact",
        href: "/about/contact",
      },
    ],
  },
];

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = useSelector(
    (state: RootState) => state.auth.user !== null,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="py-2 px-4 bg-accent">
      <div className="flex justify-between items-center mx-auto 2xl:max-w-7xl">
        <div>
          <Link to="/" className="text-white text-3xl">
            EPISTEME
          </Link>
        </div>

        <div className="flex gap-8">
          {navItems.map((item, index) =>
            !item.visibleTo ||
            item.visibleTo === "ALL" ||
            user?.roles?.includes(item.visibleTo) ? (
              <NavItem key={index} item={item} />
            ) : null,
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="focus:outline-none cursor-pointer">
                  {user?.photoFilePath ? (
                    <img
                      src={user.photoFilePath}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-indigo-600"
                    />
                  ) : (
                    <div className="w-12 h-12 border-2 border-indigo-600 rounded-full flex items-center justify-center bg-accent text-indigo-800 uppercase text-2xl font-bold hover:border-indigo-700 transition-colors">
                      {user?.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 border-none" align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 py-2">
                    {user?.photoFilePath ? (
                      <img
                        src={user.photoFilePath}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 border-2 border-indigo-600 rounded-full flex items-center justify-center bg-accent text-indigo-800 uppercase text-xl font-bold">
                        {user?.firstName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-sm font-normal text-gray-600">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="text-accent hover:text-accent-foreground"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="text-orange-700 hover:bg-orange-700! hover:text-white!"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="block text-left px-2 py-2 text-white hover:text-gray-200 transition-colors duration-150"
              >
                Login
              </Link>

              <div className="text-white">|</div>

              <Link
                to="/register"
                className="block text-left px-2 py-2 text-white hover:text-gray-200 transition-colors duration-150"
              >
                Register
              </Link>
            </div>
          )}
          {/* <span className="text-sm">{user?.user_metadata?.full_name}</span> */}
          {/* <ThemeSwitcher /> */}
        </div>
      </div>
    </nav>
  );
}
