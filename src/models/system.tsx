export interface LogsClient {
  id: string;
  userId: string; // Reference to user table
  action: string;
  timestamp: Date;
  details?: string;
}

export interface NotificationClient {
  id: string;
  showTo: {
    users?: string[]; // Array of user IDs
  };
  title: string;
  message: string;
  type: "info" | "warning" | "alert";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
