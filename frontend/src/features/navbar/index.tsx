import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { NavItem, type NavItemConfig } from "@/components/common/NavItem";
import { Link } from "react-router-dom";

const navItems: NavItemConfig[] = [
  {
    label: "Resources",
    children: [
      {
        label: "Users",
        href: "/users",
      },
      {
        label: "Documentation",
        href: "/docs",
      },
      {
        label: "Blog",
        href: "/blog",
      },
    ],
  },
  {
    label: "Admin",
    children: [
      {
        label: "Dashboard",
        href: "/admin",
      },
      {
        label: "Settings",
        children: [
          {
            label: "General",
            href: "/admin/settings/general",
          },
          {
            label: "Users",
            href: "/admin/settings/users",
          },
        ],
      },
      {
        label: "Reports",
        href: "/admin/reports",
      },
    ],
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

  return (
    <nav className="w-full py-2 px-4 bg-accent text-foreground flex justify-between items-center">
      <div>
        <Link to="/" className="text-white text-3xl">
          EPISTEME
        </Link>
      </div>

      <div className="flex gap-8">
        {navItems.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user?.photoFilePath ? (
          <img
            src={user.photoFilePath}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <div className="w-12 h-12 border-2 border-indigo-600 rounded-full flex items-center justify-center bg-accent text-indigo-800 text-2xl font-bold">
                  {user?.firstName?.charAt(0)}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
        {/* <span className="text-sm">{user?.user_metadata?.full_name}</span> */}
        {/* <ThemeSwitcher /> */}
      </div>
    </nav>
  );
}
