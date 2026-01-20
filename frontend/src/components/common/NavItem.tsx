import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { UserRole } from "@/models/user";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";

export interface NavItemConfig {
  label: string;
  href?: string;
  children?: NavItemConfig[];
  visibleTo?: "ALL" | UserRole;
}

interface NavItemProps {
  item: NavItemConfig;
}

export function NavItem({ item }: NavItemProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canView = (visibleTo?: "ALL" | UserRole) => {
    if (!visibleTo || visibleTo === "ALL") return true;
    return Boolean(user?.roles?.includes(visibleTo));
  };

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
      <div className="flex items-center gap-1 text-white cursor-pointer">
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
            className="absolute left-0 top-full w-48 h-2 z-40"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          <div
            className="absolute left-0 mt-2 w-48 text-white bg-accent rounded-lg shadow-lg z-50 
              animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="py-2">
              {item.children?.map((child, index) => {
                if (!canView(child.visibleTo)) return null;

                return (
                  <div key={index}>
                    {child.children ? (
                      <NestedNavItem item={child} />
                    ) : (
                      <Link
                        to={child.href || "/"}
                        className="block text-left px-4 py-2 hover:text-gray-200 transition-colors duration-150"
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
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canView = (visibleTo?: "ALL" | UserRole) => {
    if (!visibleTo || visibleTo === "ALL") return true;
    return Boolean(user?.roles?.includes(visibleTo));
  };

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
              canView(child.visibleTo) ? (
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
