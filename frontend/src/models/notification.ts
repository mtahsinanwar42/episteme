export interface Notification {
  id: number;
  usrId: number;
  type: string;
  title: string;
  message: string;
  resourceType?: string | null;
  resourceId?: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: Notification[];
}

export interface NotificationStatusResponse {
  success: boolean;
  data: {
    count: {
      total: number;
      unread: number;
      read: number;
    };
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    updated: number;
  };
}
