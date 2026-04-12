import Elysia from "elysia";

type WS = any;

const rooms = new Map<string, Set<WS>>();

function broadcastToRoom(roomId: string, sender: WS, data: any) {
  const peers = rooms.get(roomId);
  if (!peers) return;
  for (const peer of peers) {
    if (peer !== sender) {
      try {
        peer.send(JSON.stringify(data));
      } catch (e) {
        // ignore
      }
    }
  }
}

function logRoom(roomId: string) {
  const peers = rooms.get(roomId);
  if (!peers) {
    console.log(`room=${roomId} peers=0`);
    return;
  }
  const list = Array.from(peers).map((p: WS) => ({
    peerId: (p as any).data?.peerId,
    user: (p as any).data?.user,
  }));
  console.log(`room=${roomId} peers=${peers.size}`, list);
}

export const sessionModule = new Elysia({ prefix: "/session" })
  .get("/ws", () => "WebSocket endpoint")
  .ws("/ws", {
    // Elysia provides a simple ws router where handlers receive the socket
    open: (socket: WS) => {
      // attach metadata
      const data = (socket as any).data ?? ((socket as any).data = {});
      data.roomId = null;
      data.peerId = `${Math.random().toString(36).slice(2, 9)}`;
      data.user = null;
      console.log("ws open peerId=" + data.peerId);
    },

    message: (socket: WS, raw: unknown) => {
      let msg: any;
      try {
        if (typeof raw === "object" && raw !== null) {
          // Elysia auto-parses JSON messages before passing them to the handler
          msg = raw;
        } else if (typeof raw === "string") {
          msg = JSON.parse(raw);
        } else if (raw instanceof ArrayBuffer) {
          msg = JSON.parse(new TextDecoder().decode(raw));
        } else {
          return;
        }
      } catch (e) {
        return;
      }

      const type = msg.type;
      switch (type) {
        case "join": {
          const { room, user } = msg;
          const roomId = String(room);
          const data = (socket as any).data ?? ((socket as any).data = {});
          data.roomId = roomId;
          data.user = user || null;

          const existingPeers = Array.from(rooms.get(roomId) ?? []).map(
            (peer: WS) => ({
              peerId: (peer as any).data?.peerId,
              user: (peer as any).data?.user,
            }),
          );

          if (!rooms.has(roomId)) rooms.set(roomId, new Set());
          rooms.get(roomId)!.add(socket);

          // log current room state
          logRoom(roomId);

          // notify existing peers about the new peer
          broadcastToRoom(roomId, socket, {
            type: "peer-joined",
            peerId: (socket as any).data?.peerId,
            user: (socket as any).data?.user,
          });

          // send ack with assigned peerId and current peers count
          try {
            socket.send(
              JSON.stringify({
                type: "joined",
                peerId: (socket as any).data?.peerId,
                existingPeers,
              }),
            );
          } catch {}
          break;
        }

        case "offer":
        case "answer":
        case "candidate": {
          const roomId = (socket as any).data?.roomId;
          if (!roomId) return;
          // relay to other peers
          broadcastToRoom(roomId, socket, {
            type,
            from: (socket as any).data?.peerId,
            payload: msg.payload,
          });
          break;
        }

        case "chat": {
          const roomId = (socket as any).data?.roomId;
          if (!roomId) return;
          const payload = {
            type: "chat",
            from: (socket as any).data?.peerId,
            user: (socket as any).data?.user,
            message: msg.message,
            ts: Date.now(),
          };
          broadcastToRoom(roomId, socket, payload);
          break;
        }

        case "leave": {
          const roomId = (socket as any).data?.roomId;
          if (!roomId) return;
          const peers = rooms.get(roomId);
          if (peers) {
            peers.delete(socket);
            broadcastToRoom(roomId, socket, {
              type: "peer-left",
              peerId: (socket as any).data?.peerId,
            });
            if (peers.size === 0) rooms.delete(roomId);
            // log current room state
            logRoom(roomId);
          }
          break;
        }

        default:
          // unknown message
          break;
      }
    },

    close: (socket: WS) => {
      const roomId = (socket as any).data?.roomId;
      if (!roomId) return;
      const peers = rooms.get(roomId);
      if (peers) {
        peers.delete(socket);
        broadcastToRoom(roomId, socket, {
          type: "peer-left",
          peerId: (socket as any).data?.peerId,
        });
        if (peers.size === 0) rooms.delete(roomId);
        // log current room state
        logRoom(roomId);
      }
    },
  });
