const express = require("express");
const Evento = require("../models/Evento");
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

// GET /eventos - List all events and holidays
router.get("/", auth, async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ data: 1 });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /eventos - Create a new event or holiday (Admin only)
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const { titulo, descricao, data, tipo } = req.body;
    if (!titulo || !data) {
      return res.status(400).json({ msg: "Título e data são obrigatórios." });
    }
    const novoEvento = await Evento.create({
      titulo,
      descricao: descricao || "",
      data, // Formato YYYY-MM-DD
      tipo: tipo || "evento"
    });
    res.status(201).json(novoEvento);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /eventos/:id - Update an event or holiday (Admin only)
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { titulo, descricao, data, tipo } = req.body;
    const atualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      { titulo, descricao, data, tipo },
      { new: true }
    );
    if (!atualizado) {
      return res.status(404).json({ msg: "Evento não encontrado." });
    }
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// DELETE /eventos/:id - Delete an event or holiday (Admin only)
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deletado = await Evento.findByIdAndDelete(req.params.id);
    if (!deletado) {
      return res.status(404).json({ msg: "Evento não encontrado." });
    }
    res.json({ msg: "Evento removido com sucesso." });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

module.exports = router;
