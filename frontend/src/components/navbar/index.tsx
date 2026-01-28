import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@/stores/store";
import {
  NavItem,
  type NavItemConfig,
  canViewNavItem,
} from "@/components/common/NavItem";
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
import { User, LogOut, Menu } from "lucide-react";
import { UserRole } from "@/models/user";
import { config } from "@/config/config";

const navItems: NavItemConfig[] = [
  {
    label: "Activities",
    href: "/activities",
    visibleTo: [UserRole.PUBLIC, UserRole.USER, UserRole.ADMIN],
  },
  {
    label: "Announcements",
    href: "/announcements",
    visibleTo: [UserRole.PUBLIC, UserRole.USER],
  },
  {
    label: "Trainings",
    href: "/trainings",
    visibleTo: [UserRole.PUBLIC, UserRole.USER],
  },
  {
    label: "Blogs",
    href: "/blogs",
    visibleTo: [UserRole.PUBLIC, UserRole.USER],
  },
  {
    label: "Conferences",
    href: "/conferences",
    visibleTo: [UserRole.PUBLIC, UserRole.USER],
  },
  {
    label: "Users",
    href: "/users",
    children: [
      {
        label: "All",
        href: "/users",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "New",
        href: "/users/new",
        visibleTo: UserRole.ADMIN,
      },
    ],
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Assets",
    href: "/assets",
    children: [
      {
        label: "All",
        href: "/assets",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "New",
        href: "/assets/new",
        visibleTo: UserRole.ADMIN,
      },
    ],
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Content Management",
    children: [
      {
        label: "Activities",
        href: "/admin/activities",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "Blogs",
        href: "/admin/blogs",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "Trainings",
        href: "/admin/trainings",
        visibleTo: UserRole.ADMIN,
      },
      {
        label: "Announcements",
        href: "/admin/announcements",
        visibleTo: UserRole.ADMIN,
      },
    ],
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Conferences",
    href: "/admin/conferences",
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Submissions",
    href: "/user/submissions",
    visibleTo: UserRole.USER,
  },
  {
    label: "Submissions",
    href: "/admin/submissions",
    visibleTo: UserRole.ADMIN,
  },
  {
    label: "Review Assignments",
    href: "/reviewer/review-assignments",
    visibleTo: UserRole.REVIEWER,
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
  const isLoggedIn = user !== null;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="py-2 px-4 border-b border-border bg-background">
      <div className="flex justify-between items-center mx-auto 2xl:max-w-7xl">
        <div>
          <Link to="/" className="text-accent text-3xl">
            EPISTEME
          </Link>
        </div>

        <div className="hidden lg:flex! gap-8">
          {navItems.map((item, index) =>
            canViewNavItem(item.visibleTo, user?.roles, isLoggedIn) ? (
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
                      src={`${new URL(config.baseUrl).origin}/${user.photoFilePath}`}
                      alt="Profile"
                      crossOrigin="anonymous"
                      className="w-12 h-12 rounded-full border-2 border-indigo-600"
                    />
                  ) : (
                    <div className="w-12 h-12 border-2 border-indigo-600 rounded-full flex items-center justify-center bg-accent text-indigo-800 uppercase text-2xl font-bold hover:border-indigo-700 transition-colors">
                      {user?.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 border border-border bg-card z-100"
                align="end"
              >
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 py-2">
                    {user?.photoFilePath ? (
                      <img
                        src={`${new URL(config.baseUrl).origin}/${user.photoFilePath}`}
                        alt="Profile"
                        crossOrigin="anonymous"
                        className="w-12 h-12 rounded-full object-cover"
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
            </div>
          )}
          <div className="block lg:hidden">
            <Menu />
          </div>
          {/* <ThemeSwitcher /> */}
        </div>
      </div>
    </nav>
  );
}
