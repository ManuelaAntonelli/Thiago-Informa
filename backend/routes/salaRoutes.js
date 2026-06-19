const express = require("express");
const multer = require("multer");
const Sala = require("../models/Sala");
const auth = require("../middleware/auth");

const router = express.Router();

// Configuração do Multer para armazenamento de fotos das salas
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware para garantir que o usuário logado é administrador
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.perfil === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Acesso negado. Apenas administradores." });
  }
};

// @route GET /salas
// @desc Retorna todas as salas cadastradas ordenadas por nome
router.get("/", async (req, res) => {
  try {
    const salas = await Sala.find().sort({ nome: 1 });
    res.json(salas);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar salas." });
  }
});

// @route POST /salas
// @desc Cria uma nova sala com upload de foto (Apenas Admin)
router.post("/", auth, requireAdmin, upload.single("imagem"), async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ msg: "O nome da sala é obrigatório." });
    }
    
    if (!req.file) {
      return res.status(400).json({ msg: "A foto de exibição da sala é obrigatória." });
    }

    const existe = await Sala.findOne({ nome: nome.trim() });
    if (existe) {
      return res.status(400).json({ msg: "Uma sala com este nome já existe." });
    }

    const novaSala = await Sala.create({
      nome: nome.trim(),
      imagem: req.file.filename
    });

    res.status(201).json(novaSala);
  } catch (err) {
    res.status(500).json({ msg: err.message || "Erro ao criar sala." });
  }
});

// @route DELETE /salas/:id
// @desc Remove uma sala (Apenas Admin) e deleta projetos associados
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) {
      return res.status(404).json({ msg: "Sala não encontrada." });
    }

    // Deleta todos os projetos associados a esta sala
    const Projeto = require("../models/Projeto");
    await Projeto.deleteMany({ sala: req.params.id });

    await Sala.findByIdAndDelete(req.params.id);
    res.json({ msg: "Sala e projetos associados removidos com sucesso." });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao remover sala." });
  }
});

module.exports = router;
