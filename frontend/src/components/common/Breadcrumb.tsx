import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <Link
        to="/"
        className="flex items-center text-slate-600 hover:text-accent transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-slate-600 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-900 font-medium" : "text-slate-600"}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
