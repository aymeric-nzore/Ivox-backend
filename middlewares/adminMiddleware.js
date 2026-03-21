const adminMiddleware = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    return res.status(500).json({ message: "Configuration serveur manquante: ADMIN_API_KEY" });
  }

  const incomingKey = req.headers["x-admin-key"];
  if (!incomingKey || incomingKey !== configuredKey) {
    return res.status(403).json({ message: "Acces admin refuse" });
  }

  return next();
};

export default adminMiddleware;
