type WSSender = { send: (data: string) => void };

const sockets = new Map<string, Set<WSSender>>();

export const NotificationHub = {
  add(userId: string, ws: WSSender) {
    if (!sockets.has(userId)) sockets.set(userId, new Set());
    sockets.get(userId)!.add(ws);
  },

  remove(userId: string, ws: WSSender) {
    const set = sockets.get(userId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) sockets.delete(userId);
  },

  broadcastToUser(userId: string, payload: unknown) {
    const set = sockets.get(userId);
    if (!set) return;
    const data = JSON.stringify(payload);
    for (const ws of set) {
      try {
        ws.send(data);
      } catch {
        // ignore send errors
      }
    }
  },
};

export default NotificationHub;
