export interface LogsClient {
  id: string;
  timestamp: Date;
  userId: string; // Reference to user table
  action: string;
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
