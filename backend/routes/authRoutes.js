const express = require("express");
const AuthFacade = require("../facades/AuthFacade");
const auth = require("../middleware/auth");

const router = express.Router();

// Helper middleware to ensure user is an administrator
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.perfil === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Acesso negado. Apenas administradores." });
  }
};

// Route: Login (uses usuario and senha instead of email)
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ msg: "Usuário e senha são obrigatórios" });
    }
    const data = await AuthFacade.login(usuario, senha);
    res.json(data);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Route: Register (can be used for custom signups if needed, or by admin)
router.post("/register", async (req, res) => {
  try {
    const { nome, usuario, senha, perfil } = req.body;
    const user = await AuthFacade.register(nome, usuario, senha, perfil || "responsavel");
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Route: Change Password (any logged-in user can change their own password)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { novaSenha } = req.body;
    if (!novaSenha) {
      return res.status(400).json({ msg: "Nova senha é obrigatória" });
    }
    const result = await AuthFacade.changePassword(req.user.id, novaSenha);
    res.json(result);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Route: List Responsibles (Admin only)
router.get("/responsibles", auth, requireAdmin, async (req, res) => {
  try {
    const responsibles = await AuthFacade.listResponsibles();
    res.json(responsibles);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Route: Create Responsible Account (Admin only)
router.post("/responsibles", auth, requireAdmin, async (req, res) => {
  try {
    const { nome, usuario, senha } = req.body;
    if (!nome || !usuario || !senha) {
      return res.status(400).json({ msg: "Todos os campos são obrigatórios" });
    }
    const newResponsible = await AuthFacade.register(nome, usuario, senha, "responsavel");
    res.status(201).json(newResponsible);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Route: Delete Account (Admin only)
router.delete("/responsibles/:id", auth, requireAdmin, async (req, res) => {
  try {
    const result = await AuthFacade.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

module.exports = router;