import { type ReactNode } from "react";

interface CardProps {
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
  title: string;
  statusBadge?: ReactNode;
  metadata?: ReactNode;
  onClick?: () => void;
}

export function Card({
  imageUrl,
  imageAlt = "",
  showImage = true,
  title,
  statusBadge,
  metadata,
  onClick,
}: CardProps) {
  return (
    <div
      className="rounded-lg border border-slate-200 bg-accent-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {statusBadge}
          {metadata}
        </div>
      </div>
    </div>
  );
}
