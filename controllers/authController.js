import User from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const normalizedUsername = username?.trim()?.toLowerCase();
  const normalizedEmail = email?.trim()?.toLowerCase();
  const normalizedPassword = password?.trim();

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Configuration serveur manquante: JWT_SECRET" });
  }

  if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }
  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: "Mot de passe trop faible" });
  }

  try {
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: normalizedPassword,
    });

    return res.status(201).json({
      token: generateToken({ _id: user._id }),
      userId: user._id,
    });
  } catch (error) {
    console.log("registerUser error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Nom d'utilisateur ou email deja utilise" });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors || {})[0]?.message;
      return res.status(400).json({ message: firstError || "Donnees invalides" });
    }
    if (error.message?.toLowerCase().includes("buffering timed out")) {
      return res.status(500).json({ message: "Base de donnees indisponible" });
    }
    return res.status(500).json({ message: "Erreur lors de l'inscription", detail: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: "Identifiants et mot de passe requis" });
  }

  try {
    const identifier = usernameOrEmail.trim();
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isPasswordMatch = await user.correctPassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Mot de passe invalide" });
    }

    return res.status(200).json({
      token: generateToken({ _id: user._id }),
      userId: user._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const googleAuthCallback = async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Google authentication failed" });
  }

  return res.status(200).json({
    token: generateToken(req.user),
    userId: req.user._id,
  });
};
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    return res.json({ message: "Compte Supprimé" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
