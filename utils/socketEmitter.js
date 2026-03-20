export const getIoFromRequest = (req) => {
  return req?.app?.get?.("io") || null;
};

export const emitGlobalEvent = (req, eventName, payload) => {
  const io = getIoFromRequest(req);
  if (!io?.emit) {
    return false;
  }

  io.emit(eventName, payload);
  return true;
};

export const emitUserEvent = (req, userId, eventName, payload) => {
  const io = getIoFromRequest(req);
  if (!io?.to || !userId) {
    return false;
  }

  io.to(userId.toString()).emit(eventName, payload);
  return true;
};
