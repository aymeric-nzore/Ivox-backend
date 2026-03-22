import Message from "../models/message.js";
import User from "../models/user.js";
import { getRoomId } from "../utils/chatHelper.js";
import { v4 as uuidv4 } from "uuid";
import { emitMessageEvents, emitReadEvents } from "../services/notificationService.js";
//Envoyé message
export const sendMessage = async ({ sender, receiver, message }) => {
  if (!sender || !receiver || !message) {
    throw new Error("sender, receiver et message sont requis");
  }

  const chatRoomId = getRoomId(sender.toString(), receiver.toString());

  try {
    const newMessage = await Message.create({
      chatRoomId,
      messageId: uuidv4(),
      sender,
      receiver,
      message,
    });
    return newMessage;
  } catch (error) {
    throw error;
  }
};
//Marqué comme delivré
export const markAsDelivered = async (messageId) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      { status: "delivered" },
      { new: true },
    );
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};
//Marqué comme lu
export const markAsRead = async (messageId) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      { status: "read" },
      { new: true },
    );
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};
//Charger les messages
export const getChatMessages = async (chatRoomId) => {
  try {
    const messages = await Message.find({ chatRoomId }).sort({ createdAt: -1 });
    return messages;
  } catch (e) {
    throw e;
  }
};

export const getChatUsers = async (currentUserId) => {
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("username email status lastSeen photoUrl")
    .sort({ username: 1 });

  return users.map((user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    status: user.status,
    lastSeen: user.lastSeen,
    photoUrl: user.photoUrl || null,
  }));
};

export const getChatUsersHandler = async (req, res) => {
  try {
    const users = await getChatUsers(req.user._id);
    return res.status(200).json(users);
  } catch (_error) {
    return res.status(500).json({ message: "Erreur chargement utilisateurs" });
  }
};

export const getMessagesWithUserHandler = async (req, res) => {
  const withUserId = req.params.withUserId;
  if (!withUserId) {
    return res.status(400).json({ message: "withUserId est requis" });
  }

  try {
    const roomId = getRoomId(req.user._id.toString(), withUserId.toString());
    const messages = await getChatMessages(roomId);

    return res.status(200).json(
      messages
        .slice()
        .reverse()
        .map((message) => ({
          id: message._id,
          messageId: message.messageId,
          sender: message.sender,
          receiver: message.receiver,
          message: message.message,
          status: message.status,
          createdAt: message.createdAt,
        })),
    );
  } catch (_error) {
    return res.status(500).json({ message: "Erreur chargement messages" });
  }
};

export const sendMessageHandler = async (req, res) => {
  const { receiver, message } = req.body;
  if (!receiver || !message) {
    return res.status(400).json({ message: "receiver et message sont requis" });
  }

  try {
    const created = await sendMessage({
      sender: req.user._id,
      receiver,
      message,
    });

    const payload = created.toObject ? created.toObject() : created;
    emitMessageEvents(req.app.get("io"), payload);

    return res.status(201).json({
      id: created._id,
      messageId: created.messageId,
      sender: created.sender,
      receiver: created.receiver,
      message: created.message,
      status: created.status,
      createdAt: created.createdAt,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Erreur envoi message" });
  }
};

export const markMessageAsReadHandler = async (req, res) => {
  const { messageId } = req.params;
  if (!messageId) {
    return res.status(400).json({ message: "messageId est requis" });
  }

  try {
    const updated = await markAsRead(messageId);
    if (!updated) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    const payload = updated.toObject ? updated.toObject() : updated;
    emitReadEvents(req.app.get("io"), payload, req.user._id);

    return res.status(200).json({
      id: updated._id,
      messageId: updated.messageId,
      sender: updated.sender,
      receiver: updated.receiver,
      message: updated.message,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Erreur lecture message" });
  }
};

export const reportMessageHandler = async (req, res) => {
  const { messageId } = req.params;
  const { reason } = req.body || {};

  if (!messageId) {
    return res.status(400).json({ message: "messageId est requis" });
  }

  try {
    const message = await Message.findOne({ messageId });
    if (!message) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    // Projet academique: on journalise le signalement en attendant un module moderation.
    console.log("Message reported", {
      messageId,
      reportedBy: req.user?._id?.toString(),
      reason: reason || "unspecified",
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "Message signale" });
  } catch (_error) {
    return res.status(500).json({ message: "Erreur signalement message" });
  }
};
