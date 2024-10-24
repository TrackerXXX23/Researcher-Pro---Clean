import { Server as SocketServer } from 'socket.io';

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  reportId: string;
  parentId?: string;
  mentions?: string[];
}

interface Change {
  id: string;
  userId: string;
  reportId: string;
  type: 'edit' | 'delete' | 'add';
  content: string;
  timestamp: string;
  section?: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'share' | 'comment' | 'change';
  content: string;
  timestamp: string;
  read: boolean;
  reportId: string;
  actionUrl?: string;
}

interface UserPresence {
  userId: string;
  reportId: string;
  lastActive: string;
  status: 'active' | 'idle' | 'offline';
  currentSection?: string;
}

class CollaborationService {
  private io: SocketServer;
  private activeUsers: Map<string, UserPresence>;
  private reportSubscriptions: Map<string, Set<string>>;

  constructor(io: SocketServer) {
    this.io = io;
    this.activeUsers = new Map();
    this.reportSubscriptions = new Map();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      // Handle user presence
      socket.on('user:join', (data: { userId: string; reportId: string }) => {
        this.handleUserJoin(socket.id, data);
      });

      socket.on('user:leave', (data: { userId: string; reportId: string }) => {
        this.handleUserLeave(socket.id, data);
      });

      // Handle real-time editing
      socket.on('report:change', (change: Change) => {
        this.handleReportChange(change);
      });

      // Handle comments
      socket.on('comment:add', (comment: Comment) => {
        this.handleNewComment(comment);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  private handleUserJoin(socketId: string, data: { userId: string; reportId: string }): void {
    const presence: UserPresence = {
      userId: data.userId,
      reportId: data.reportId,
      lastActive: new Date().toISOString(),
      status: 'active',
    };

    this.activeUsers.set(socketId, presence);
    this.addToReportSubscription(data.reportId, socketId);
    this.broadcastPresenceUpdate(data.reportId);
  }

  private handleUserLeave(socketId: string, data: { userId: string; reportId: string }): void {
    this.activeUsers.delete(socketId);
    this.removeFromReportSubscription(data.reportId, socketId);
    this.broadcastPresenceUpdate(data.reportId);
  }

  private handleDisconnect(socketId: string): void {
    const presence = this.activeUsers.get(socketId);
    if (presence) {
      this.activeUsers.delete(socketId);
      this.removeFromReportSubscription(presence.reportId, socketId);
      this.broadcastPresenceUpdate(presence.reportId);
    }
  }

  private addToReportSubscription(reportId: string, socketId: string): void {
    if (!this.reportSubscriptions.has(reportId)) {
      this.reportSubscriptions.set(reportId, new Set());
    }
    this.reportSubscriptions.get(reportId)?.add(socketId);
  }

  private removeFromReportSubscription(reportId: string, socketId: string): void {
    this.reportSubscriptions.get(reportId)?.delete(socketId);
    if (this.reportSubscriptions.get(reportId)?.size === 0) {
      this.reportSubscriptions.delete(reportId);
    }
  }

  private broadcastPresenceUpdate(reportId: string): void {
    const subscribers = this.reportSubscriptions.get(reportId);
    if (!subscribers) return;

    const presenceList = Array.from(this.activeUsers.values())
      .filter(presence => presence.reportId === reportId);

    subscribers.forEach(socketId => {
      this.io.to(socketId).emit('presence:update', presenceList);
    });
  }

  private handleReportChange(change: Change): void {
    const subscribers = this.reportSubscriptions.get(change.reportId);
    if (!subscribers) return;

    subscribers.forEach(socketId => {
      this.io.to(socketId).emit('report:change', change);
    });
  }

  private handleNewComment(comment: Comment): void {
    const subscribers = this.reportSubscriptions.get(comment.reportId);
    if (!subscribers) return;

    subscribers.forEach(socketId => {
      this.io.to(socketId).emit('comment:new', comment);
    });

    // Process mentions and send notifications
    if (comment.mentions && comment.mentions.length > 0) {
      this.sendMentionNotifications(comment);
    }
  }

  private async sendMentionNotifications(comment: Comment): Promise<void> {
    const notifications: Notification[] = comment.mentions!.map(userId => ({
      id: `notification-${Date.now()}-${Math.random()}`,
      userId,
      type: 'mention',
      content: `You were mentioned in a comment by ${comment.userId}`,
      timestamp: new Date().toISOString(),
      read: false,
      reportId: comment.reportId,
      actionUrl: `/report/${comment.reportId}#comment-${comment.id}`,
    }));

    notifications.forEach(notification => {
      this.io.to(notification.userId).emit('notification:new', notification);
    });
  }

  async shareReport(reportId: string, users: string[]): Promise<void> {
    const notification: Notification = {
      id: `share-${Date.now()}-${Math.random()}`,
      userId: users[0], // Assuming single user for simplicity
      type: 'share',
      content: 'A new report has been shared with you',
      timestamp: new Date().toISOString(),
      read: false,
      reportId,
      actionUrl: `/report/${reportId}`,
    };

    users.forEach(userId => {
      this.io.to(userId).emit('notification:new', notification);
    });
  }

  async addComment(reportId: string, comment: Comment): Promise<void> {
    this.handleNewComment(comment);
  }

  async trackChanges(reportId: string, change: Change): Promise<void> {
    this.handleReportChange(change);
  }
}

export type { Comment, Change, Notification, UserPresence };
export { CollaborationService };
