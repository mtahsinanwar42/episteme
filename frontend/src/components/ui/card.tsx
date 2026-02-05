import { type ReactNode } from "react";

interface CardProps {
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
  title: string;
  description?: ReactNode;
  statusBadge?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

export function Card({
  imageUrl,
  imageAlt = "",
  showImage = true,
  title,
  description,
  statusBadge,
  metadata,
  actions,
  onClick,
}: CardProps) {
  return (
    <div
      className="relative grid grid-cols-2 rounded-lg border-b-2 border-border gradient-card shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {showImage && imageUrl && (
        <div className="w-full bg-slate-100 order-2 h-96">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            loading="lazy"
          />
        </div>
      )}

      <div className="h-full p-4 flex flex-col justify-end gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground pr-4">{title}</h2>
          {actions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4"
            >
              {actions}
            </div>
          )}

          {description}
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          {metadata}
        </div>
      </div>
    </div>
  );
}
