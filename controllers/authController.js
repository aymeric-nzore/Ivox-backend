import { register, login } from "../services/authService.js";
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await register(username, email, password);
    if (user?.error) {
      return res.status(400).json({ message: user.error });
    }
    return res.status(201).json(user);
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
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
