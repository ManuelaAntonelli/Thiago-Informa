const express = require("express");
const multer = require("multer");

const Projeto =
  require("../models/Projeto");

const auth =
  require("../middleware/auth");

const router = express.Router();

const storage =
  multer.diskStorage({
    destination:
      "uploads/",

    filename:
      (req, file, cb) => {
        cb(
          null,
          Date.now() +
            "-" +
            file.originalname
        );
      }
  });

const upload =
  multer({ storage });

router.get(
  "/",
  async (req, res) => {
    try {
      const filter = {};
      if (req.query.sala) {
        filter.sala = req.query.sala;
      }
      const dados = await Projeto.find(filter)
        .populate("sala")
        .sort({ createdAt: -1 });
      res.json(dados);
    } catch (err) {
      res.status(500).json({ msg: "Erro ao buscar projetos." });
    }
  }
);

router.post(
  "/",
  auth,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      const imagens = req.files ? req.files.map(file => file.filename) : [];
      const primeiraImagem = imagens.length > 0 ? imagens[0] : null;

      const projeto = await Projeto.create({
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        imagem: primeiraImagem,
        imagens: imagens,
        sala: req.body.sala || null,
        fixado: req.body.fixado === "true" || req.body.fixado === true
      });

      res.json(projeto);
    } catch (err) {
      res.status(500).json({ msg: err.message || "Erro ao criar projeto." });
    }
  }
);

router.put(
  "/:id",
  auth,
  async (req, res) => {
    const projeto =
      await Projeto.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.json(projeto);
  }
);

router.delete(
  "/:id",
  auth,
  async (req, res) => {
    await Projeto.findByIdAndDelete(
      req.params.id
    );

    res.json({
      msg: "Projeto removido"
    });
  }
);

module.exports = router;