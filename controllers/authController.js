import User from "../models/user.js";
import { register, login } from "../services/authService.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await register(username, email, password);
    if (user?.error) {
      return res.status(400).json({ message: user.error });
    }
    return res.status(201).json({
      token: generateToken({ _id: user.userId }),
      userId: user.userId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};
export const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const response = await login(usernameOrEmail, password);
    if (response?.error) {
      if (response.error === "Identifiants et mot de passe requis") {
        return res.status(400).json({ message: response.error });
      }
      if (response.error === "Erreur serveur") {
        return res.status(500).json({ message: response.error });
      }
      return res.status(401).json({ message: response.error });
    }
    return res.status(200).json({
      token: generateToken({ _id: response.userId }),
      userId: response.userId,
    });
  } catch (error) {
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
