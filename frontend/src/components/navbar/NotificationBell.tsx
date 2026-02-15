import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useNotificationStatus,
  useNotifications,
  useMarkAsReadMutation,
} from "@/hooks/useNotifications";
import type { Notification } from "@/models/notification";

const CHUNK_SIZE = 5;
const SUBMISSION_RESOURCE_TYPE = "ContentSubmission";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getSubmissionPath(notification: Notification): string | null {
  if (
    notification.resourceType !== SUBMISSION_RESOURCE_TYPE ||
    notification.resourceId == null
  ) {
    return null;
  }

  return `/submissions/${notification.resourceId}`;
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: () => void;
}) {
  const path = getSubmissionPath(notification);
  const isClickable = !!path && !!onClick;
  const baseItemClass =
    "notif-entry px-3 py-2.5 transition-colors duration-150 border-l-2";
  const unreadClass =
    "border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20";
  const readClass = "border-l-transparent bg-transparent";

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`${baseItemClass} ${
        notification.isRead
          ? readClass
          : unreadClass
      } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
    >
      <p className="text-sm font-medium text-foreground leading-tight">
        {notification.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
        {notification.message}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        {timeAgo(notification.createdAt)}
      </p>
    </div>
  );
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState(CHUNK_SIZE);
  const wasOpenRef = useRef(false);
  const lastFetchedIdsRef = useRef<number[]>([]);

  const { data: statusData } = useNotificationStatus(!isOpen);
  const { data: notifData, isLoading } = useNotifications(
    { page: 1, limit },
    isOpen,
  );
  const markAsRead = useMarkAsReadMutation();

  const unreadCount = statusData?.data?.count?.unread ?? 0;
  const notifications = notifData?.data ?? [];
  const total = notifData?.total ?? 0;
  const hasMore = notifications.length < total;

  useEffect(() => {
    lastFetchedIdsRef.current = notifications.map((notif) => notif.id);
  }, [notifications]);

  useEffect(() => {
    if (!isOpen && wasOpenRef.current) {
      if (lastFetchedIdsRef.current.length > 0) {
        markAsRead.mutate(lastFetchedIdsRef.current);
      }
      setLimit(CHUNK_SIZE);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, markAsRead]);

  function handleNotificationClick(notification: Notification) {
    const path = getSubmissionPath(notification);

    if (!path) {
      return;
    }

    setIsOpen(false);
    navigate(path);
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="relative cursor-pointer p-1 text-muted-foreground hover:text-foreground transition-colors outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 border border-border bg-card z-100 p-0"
        align="end"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <span className="font-semibold text-sm">Notifications</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-[32rem] overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <>
              {notifications.map((notif) => (
                <div key={notif.id}>
                  <NotificationItem
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                  />
                  <DropdownMenuSeparator className="my-0" />
                </div>
              ))}
            </>
          )}
        </div>

        {hasMore && !isLoading && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setLimit((prev) => prev + CHUNK_SIZE);
              }}
              className="w-full px-3 py-2 text-sm text-indigo-600 hover:bg-accent text-center cursor-pointer font-medium"
            >
              Load More
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
