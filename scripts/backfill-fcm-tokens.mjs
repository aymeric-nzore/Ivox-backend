import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.js";

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI manquant dans .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const missingFieldResult = await User.updateMany(
    { fcmTokens: { $exists: false } },
    { $set: { fcmTokens: [] } },
  );

  const nullFieldResult = await User.updateMany(
    { fcmTokens: null },
    { $set: { fcmTokens: [] } },
  );

  const nonArrayFieldResult = await User.updateMany(
    {
      fcmTokens: {
        $exists: true,
        $not: { $type: "array" },
      },
    },
    { $set: { fcmTokens: [] } },
  );

  console.log("Backfill termine");
  console.log(
    JSON.stringify(
      {
        missingFieldUpdated: missingFieldResult.modifiedCount,
        nullFieldUpdated: nullFieldResult.modifiedCount,
        nonArrayFieldUpdated: nonArrayFieldResult.modifiedCount,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Backfill FCM tokens echoue:", error?.message || error);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
