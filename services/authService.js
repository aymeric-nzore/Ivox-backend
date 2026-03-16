import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const register = async (username, email, password) => {
  if (!username || !email || !password) {
    return { error: "Tous les champs sont requis" };
  }
  if (password.length < 6) {
    return { error: "Mot de passe trop faible" };
  }
  try {
    const user = await User.create({ username, email, password });
    return { userId: user._id };
  } catch (e) {
    if (e.code === 11000) {
      return { error: "Nom d'utilisateur ou email deja utilise" };
    } else {
      return { error: "Register failed" };
    }
  }
};
export const login = async (usernameOrEmail, password) => {
  if (!usernameOrEmail || !password) {
    return { error: "Identifiants et mot de passe requis" };
  }
  const identifier = usernameOrEmail.trim();
  try {
    const user = await User.findOne({
      $or: [
        {
          email: identifier.toLowerCase(),
        },
        {
          username: identifier.toLowerCase(),
        },
      ],
    });
    if (!user) {
      return { error: "Identifiants invalides" };
    }
    const isPasswordMatch = await user.correctPassword(password, user.password);
    if (!isPasswordMatch) {
      return { error: "Mot de passe invalide" };
    }
    return {
      token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10d",
      }),
      userId: user._id,
    };
  } catch (e) {
    console.log(e.message);
    return { error: "Erreur serveur" };
  }
};
