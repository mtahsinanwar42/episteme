import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '@/stores/store';
import {
  NavItem,
  type NavItemConfig,
  canViewNavItem,
} from '@/components/common/NavItem';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/stores/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu } from 'lucide-react';
import { UserRole } from '@/models/user';
import { config } from '@/config/config';

const avatarColors = [
  {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-500',
    hoverBorder: 'hover:border-red-600',
  },
  {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-500',
    hoverBorder: 'hover:border-orange-600',
  },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-500',
    hoverBorder: 'hover:border-emerald-600',
  },
  {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-500',
    hoverBorder: 'hover:border-teal-600',
  },
  {
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-500',
    hoverBorder: 'hover:border-sky-600',
  },
  {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-500',
    hoverBorder: 'hover:border-blue-600',
  },
  {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-500',
    hoverBorder: 'hover:border-indigo-600',
  },
  {
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    border: 'border-violet-500',
    hoverBorder: 'hover:border-violet-600',
  },
  {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-500',
    hoverBorder: 'hover:border-pink-600',
  },
  {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-500',
    hoverBorder: 'hover:border-rose-600',
  },
];

const getAvatarColor = (name?: string) => {
  const str = name || '';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const aboutNavItem: NavItemConfig = {
  label: 'About',
  children: [
    {
      label: 'Mission & Vision',
      href: '/about/mission',
    },
    {
      label: 'Ethics',
      href: '/about/ethics',
    },
    {
      label: 'Sustainability',
      href: '/about/sustainability',
    },
    {
      label: 'Executive Committee',
      href: '/about/executive',
    },
    {
      label: 'Policies',
      href: '/about/policies',
    },
    {
      label: 'Career',
      href: '/about/career',
    },
    {
      label: 'Contact',
      href: '/about/contact',
    },
  ],
};

const publicNavItems: NavItemConfig[] = [
  aboutNavItem,
  { label: 'Conferences', href: '/conferences' },
  { label: 'Trainings', href: '/trainings' },
  { label: 'Announcements', href: '/announcements' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Activities', href: '/activities' },
];

const adminNavItems: NavItemConfig[] = [
  aboutNavItem,
  {
    label: 'Users',
    href: '/users',
    children: [
      { label: 'New', href: '/users/new' },
      { label: 'All', href: '/users' },
    ],
  },
  {
    label: 'Submissions',
    href: '/submissions',
  },
  {
    label: 'Reviewer Assignments',
    href: '/reviewer/review-assignments',
  },
  {
    label: 'Conferences',
    href: '/conferences',
    children: [
      { label: 'New', href: '/conferences/new' },
      { label: 'All', href: '/conferences' },
    ],
  },
  {
    label: 'Trainings',
    href: '/trainings',
    children: [
      { label: 'New', href: '/trainings/new' },
      { label: 'All', href: '/trainings' },
    ],
  },
  {
    label: 'Announcements',
    href: '/announcements',
    children: [
      { label: 'New', href: '/announcements/new' },
      { label: 'All', href: '/announcements' },
    ],
  },
  {
    label: 'Blogs',
    href: '/blogs',
    children: [
      { label: 'New', href: '/blogs/new' },
      { label: 'All', href: '/blogs' },
    ],
  },
  {
    label: 'Activities',
    href: '/activities',
    children: [
      { label: 'New', href: '/activities/new' },
      { label: 'All', href: '/activities' },
    ],
  },
  {
    label: 'Assets',
    href: '/assets',
    children: [
      { label: 'New', href: '/assets/new' },
      { label: 'All', href: '/assets' },
    ],
  },
];

const reviewerNavItems: NavItemConfig[] = [
  aboutNavItem,
  {
    label: 'Submissions',
    href: '/user/submissions',
    children: [
      { label: 'New', href: '/user/submissions/new' },
      { label: 'My Submissions', href: '/user/submissions' },
      {
        label: 'Assigned Reviews',
        href: '/reviewer/review-assignments',
      },
    ],
  },
  { label: 'Conferences', href: '/conferences' },
  { label: 'Trainings', href: '/trainings' },
  { label: 'Announcements', href: '/announcements' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Activities', href: '/activities' },
];

const userNavItems: NavItemConfig[] = [
  aboutNavItem,
  {
    label: 'Submissions',
    href: '/user/submissions',
    children: [
      { label: 'New', href: '/user/submissions/new' },
      { label: 'My Submissions', href: '/user/submissions' },
    ],
  },
  { label: 'Conferences', href: '/conferences' },
  { label: 'Trainings', href: '/trainings' },
  { label: 'Announcements', href: '/announcements' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Activities', href: '/activities' },
];

const getNavItemsForUser = (
  roles: UserRole[] | undefined,
  isLoggedIn: boolean,
): NavItemConfig[] => {
  if (!isLoggedIn) return publicNavItems;
  if (roles?.includes(UserRole.ADMIN)) return adminNavItems;
  if (roles?.includes(UserRole.REVIEWER)) return reviewerNavItems;
  return userNavItems;
};

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = user !== null;
  const isAdmin = user?.roles?.includes(UserRole.ADMIN);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = getNavItemsForUser(user?.roles, isLoggedIn);

  return (
    <nav className="py-2 px-4 border-b border-border bg-background backdrop-blur-xs">
      <div
        className={`flex justify-between items-center ${
          isAdmin ? 'w-full' : 'mx-auto 2xl:max-w-7xl'
        }`}
      >
        <div>
          <Link
            to="/"
            className="font-semibold bg-linear-to-r from-indigo-400 via-violet-400 to-violet-500 bg-clip-text text-transparent text-3xl"
          >
            EPISTEME
          </Link>
        </div>

        <div
          className={`hidden lg:flex! ${isAdmin ? 'gap-6' : 'gap-8'} lg:h-12`}
        >
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
                    <div
                      className={`w-12 h-12 border-2 ${getAvatarColor(user?.firstName).border} rounded-full flex items-center justify-center ${getAvatarColor(user?.firstName).bg} ${getAvatarColor(user?.firstName).text} uppercase text-2xl font-bold ${getAvatarColor(user?.firstName).hoverBorder} transition-colors`}
                    >
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
                      <div
                        className={`w-12 h-12 border-2 ${getAvatarColor(user?.firstName).border} rounded-full flex items-center justify-center ${getAvatarColor(user?.firstName).bg} ${getAvatarColor(user?.firstName).text} uppercase text-xl font-bold`}
                      >
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
                  onClick={() => navigate('/profile')}
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
            <div className="flex items-center">
              <Link
                to="/login"
                className="block text-left px-2 py-2 text-white hover:text-gray-200 transition-colors duration-150"
              >
                Login
              </Link>
              <span className="text-white">|</span>
              <Link
                to="/register"
                className="block text-left px-2 py-2 text-white hover:text-gray-200 transition-colors duration-150"
              >
                Register
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
