import { sendPushToUser } from "./pushNotificationService.js";

export const toUserRoom = (userId) => `user:${userId}`;

export const joinUserChannels = (socket, userId) => {
  const id = userId?.toString();
  if (!id) return;

  // Legacy room + dedicated user room.
  socket.join(id);
  socket.join(toUserRoom(id));
};

export const emitToUser = (io, userId, eventName, payload) => {
  const id = userId?.toString();
  if (!io?.to || !id) return;

  // Emit once to the union of legacy and dedicated rooms.
  io.to(id).to(toUserRoom(id)).emit(eventName, payload);
};

export const emitAppNotification = (io, userId, payload) => {
  emitToUser(io, userId, "app_notification", payload);

  const type = (payload?.type || "app").toString();
  const titleByType = {
    chat_message: "Nouveau message",
    friend_request: "Nouvelle demande d'ami",
    friend_request_response: "Reponse a votre demande d'ami",
  };

  const body =
    payload?.preview ||
    payload?.message ||
    payload?.fromUsername ||
    "Nouvelle notification";

  sendPushToUser({
    userId,
    title: titleByType[type] || "IVOX",
    body,
    data: {
      type,
      fromUserId: payload?.fromUserId,
      messageId: payload?.messageId,
      createdAt: payload?.createdAt,
    },
  }).catch(() => {});
};

export const emitPresence = (io, payload) => {
  if (!io?.emit) return;
  io.emit("user_presence", payload);
};

export const emitMessageEvents = (io, message) => {
  if (!message) return;

  const payload = {
    ...message,
    sender: message.sender?.toString?.() ?? message.sender,
    receiver: message.receiver?.toString?.() ?? message.receiver,
  };

  emitToUser(io, payload.receiver, "message_new", payload);
  emitToUser(io, payload.sender, "message_sent", payload);

  emitAppNotification(io, payload.receiver, {
    type: "chat_message",
    messageId: payload.messageId,
    fromUserId: payload.sender,
    preview: payload.message,
    createdAt: payload.createdAt,
  });
};

export const emitReadEvents = (io, message, actorUserId) => {
  if (!message) return;

  const payload = {
    ...message,
    sender: message.sender?.toString?.() ?? message.sender,
    receiver: message.receiver?.toString?.() ?? message.receiver,
  };

  emitToUser(io, actorUserId, "message_read", payload);
  emitToUser(io, payload.sender, "message_read", payload);
};

export const emitTypingEvents = (io, toUserId, fromUserId, isTyping) => {
  emitToUser(io, toUserId, isTyping ? "typing_start" : "typing_stop", {
    fromUserId: fromUserId?.toString(),
  });
};
