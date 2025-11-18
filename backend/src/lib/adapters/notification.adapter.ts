// Notification Adapter Interface

export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Adapter interface for sending notifications
 * Implementations: Email, SMS, Push, Slack, etc.
 */
export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}

/**
 * In-memory stub implementation for testing/development
 */
export class InMemoryNotificationAdapter implements INotificationAdapter {
  private sentNotifications: NotificationPayload[] = [];

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('[InMemoryNotificationAdapter] Sending:', payload);
    this.sentNotifications.push(payload);
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  }

  async sendBatch(
    payloads: NotificationPayload[],
  ): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  getSentNotifications(): NotificationPayload[] {
    return this.sentNotifications;
  }

  clear(): void {
    this.sentNotifications = [];
  }
}
