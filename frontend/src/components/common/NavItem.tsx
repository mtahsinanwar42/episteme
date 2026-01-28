import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { UserRole } from "@/models/user";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";

export type NavVisibility = "PUBLIC" | UserRole | UserRole[];

export interface NavItemConfig {
  label: string;
  href?: string;
  children?: NavItemConfig[];
  visibleTo?: NavVisibility;
}

export const canViewNavItem = (
  visibleTo?: NavVisibility,
  roles?: UserRole[],
  isLoggedIn?: boolean,
) => {
  // No visibility restriction: visible to everyone
  if (!visibleTo) {
    return true;
  }

  // PUBLIC: only visible to unauthenticated users
  if (visibleTo === "PUBLIC") {
    return !isLoggedIn;
  }

  // Array handling: can include "PUBLIC" and/or role names
  if (Array.isArray(visibleTo)) {
    // Check if "PUBLIC" is in array (visible to non-logged-in users)
    if (visibleTo.includes("PUBLIC" as any) && !isLoggedIn) {
      return true;
    }

    // Check if user is logged in and has required roles
    if (isLoggedIn && roles && roles.length > 0) {
      const roleArray = visibleTo.filter(
        (v) => v !== ("PUBLIC" as any),
      ) as UserRole[];
      if (roleArray.length > 0) {
        return roleArray.some((role) => roles.includes(role));
      }
    }

    return false;
  }

  // Single role: requires login
  if (!isLoggedIn || !roles || roles.length === 0) {
    return false;
  }

  return roles.includes(visibleTo);
};

interface NavItemProps {
  item: NavItemConfig;
}

export function NavItem({ item }: NavItemProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = user !== null;
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRoles = user?.roles;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link to={item.href || "/"} className="flex items-center text-white">
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Parent Item */}
      <div className="h-full flex items-center gap-1 text-white cursor-pointer">
        {item.label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible bridge to prevent dropdown from closing */}
          <div
            className="absolute left-0 top-full w-48 h-4 z-40"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          <div
            className="absolute left-0 mt-3 w-48 text-white bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex flex-col gap-2 p-2">
              {item.children?.map((child, index) => {
                if (!canViewNavItem(child.visibleTo, userRoles, isLoggedIn))
                  return null;

                return (
                  <div key={index}>
                    {child.children ? (
                      <NestedNavItem item={child} />
                    ) : (
                      <Link
                        to={child.href || "/"}
                        className="block text-left px-4 py-1 bg-blue-200/10 rounded-lg hover:bg-blue-200/20 hover:text-gray-200 transition-colors duration-150"
                      >
                        {child.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NestedNavItem({ item }: { item: NavItemConfig }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = user !== null;
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRoles = user?.roles;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full text-left px-4 py-2 hover:text-gray-200 transition-colors duration-150 flex items-center justify-between group-hover:text-gray-200">
        {item.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Nested Dropdown */}
      {isOpen && (
        <div
          className="absolute left-full top-0 ml-0 w-48 bg-accent rounded-lg shadow-lg z-50
            animate-in fade-in slide-in-from-left-2 duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-2">
            {item.children?.map((child, index) =>
              canViewNavItem(child.visibleTo, userRoles, isLoggedIn) ? (
                <Link
                  key={index}
                  to={child.href || "/"}
                  className="block text-left px-4 py-2 hover:text-gray-200 transition-colors duration-150"
                >
                  {child.label}
                </Link>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
