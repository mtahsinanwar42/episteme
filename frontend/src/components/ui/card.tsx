import { type ReactNode } from "react";

interface CardProps {
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
  title: string;
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
  statusBadge,
  metadata,
  actions,
  onClick,
}: CardProps) {
  return (
    <div
      className="relative h-full rounded-lg border-b-2 border-border gradient-card shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {showImage && imageUrl && (
        <div className="aspect-video w-full bg-slate-100">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            loading="lazy"
          />
        </div>
      )}

      <div className="h-full p-4 flex flex-col gap-2 justify-between">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground pr-4">{title}</h3>
          {actions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-4"
            >
              {actions}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          {metadata}
        </div>
      </div>
    </div>
  );
}
