import { ThemeSwitcher } from "@/components/common/themeSwitcher";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { NavItem, type NavItemConfig } from "@/components/common/NavItem";

const navItems: NavItemConfig[] = [
  {
    label: "Home",
    href: "/",
  },
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
    label: "About",
    href: "/about",
  },
];

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav className="w-full py-1 px-4 bg-accent text-foreground flex justify-between items-center">
      <div className="flex gap-2">
        {navItems.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </div>

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
    </nav>
  );
}
