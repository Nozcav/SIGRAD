export interface AppNotification {
  id: string;
  userId: string;
  responseId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}
