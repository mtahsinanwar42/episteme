import { type ReactNode } from 'react';

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
  imageAlt = '',
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
      className={`grid grid-cols-[50%_44%_6%] rounded-lg border-b-2 border-border gradient-card shadow-sm overflow-hidden transition-shadow ${
        onClick ? "hover:shadow-md cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="h-full p-4 flex flex-col justify-start gap-6 col-span-1">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground pr-4">{title}</h2>
          {description}
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          {metadata}
        </div>
      </div>

      <div className="w-full h-56 col-span-1 flex items-center justify-center">
        {showImage && imageUrl && (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-44 w-4/5 object-cover rounded-md"
            crossOrigin="anonymous"
            loading="lazy"
          />
        )}
      </div>

      <div
        className="p-4 flex justify-end items-start col-span-1"
        onClick={(e) => e.stopPropagation()}
      >
        {actions}
      </div>
    </div>
  );
}
