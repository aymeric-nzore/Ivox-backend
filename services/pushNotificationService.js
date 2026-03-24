import User from "../models/user.js";
import { getFirebaseMessaging } from "../config/firebaseAdmin.js";

const toStringMap = (payload = {}) => {
  const data = {};
  for (const [key, value] of Object.entries(payload || {})) {
    if (value === null || value === undefined) continue;
    data[key] = String(value);
  }
  return data;
};

const removeInvalidTokens = async (tokens = []) => {
  if (!tokens.length) return;
  await User.updateMany(
    { fcmTokens: { $in: tokens } },
    { $pull: { fcmTokens: { $in: tokens } } },
  );
};

export const sendPushToUser = async ({
  userId,
  title,
  body,
  data,
}) => {
  const messaging = getFirebaseMessaging();
  if (!userId) return;
  if (!messaging) {
    console.warn("FCM unavailable: missing Firebase Admin configuration");
    return;
  }

  const user = await User.findById(userId).select("fcmTokens");
  const tokens = (user?.fcmTokens || []).filter(Boolean);
  if (!tokens.length) {
    console.info(`No FCM token registered for user ${userId}`);
    return;
  }

  const message = {
    tokens,
    notification: {
      title: title || "IVOX",
      body: body || "Nouvelle notification",
    },
    data: toStringMap(data),
    android: {
      priority: "high",
      notification: {
        channelId: "ivox_notifications",
      },
    },
  };

  const response = await messaging.sendEachForMulticast(message);

  const invalidTokens = [];
  response.responses.forEach((result, index) => {
    if (result.success) return;
    const code = result.error?.code || "";
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-argument"
    ) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (invalidTokens.length) {
    await removeInvalidTokens(invalidTokens);
  }
};

export const sendPushToAllUsers = async ({ title, body, data }) => {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    console.warn("FCM unavailable: missing Firebase Admin configuration");
    return;
  }

  const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } }).select(
    "fcmTokens",
  );
  const tokens = users.flatMap((u) => u.fcmTokens || []).filter(Boolean);
  if (!tokens.length) return;

  const uniqueTokens = [...new Set(tokens)];

  const response = await messaging.sendEachForMulticast({
    tokens: uniqueTokens,
    notification: {
      title: title || "IVOX",
      body: body || "Nouvelle notification",
    },
    data: toStringMap(data),
    android: {
      priority: "high",
      notification: {
        channelId: "ivox_notifications",
      },
    },
  });

  const invalidTokens = [];
  response.responses.forEach((result, index) => {
    if (result.success) return;
    const code = result.error?.code || "";
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-argument"
    ) {
      invalidTokens.push(uniqueTokens[index]);
    }
  });

  if (invalidTokens.length) {
    await removeInvalidTokens(invalidTokens);
  }
};
