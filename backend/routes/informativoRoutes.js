const express = require("express");
const multer = require("multer");

const Informativo =
  require("../models/Informativo");

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
    const dados =
      await Informativo.find()
        .sort({
          createdAt: -1
        });

    res.json(dados);
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

      const novo = await Informativo.create({
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        imagem: primeiraImagem,
        imagens: imagens,
        fixado: req.body.fixado === "true" || req.body.fixado === true
      });

      res.json(novo);
    } catch (err) {
      res.status(500).json({ msg: err.message || "Erro ao criar informativo." });
    }
  }
);

router.put(
  "/:id",
  auth,
  async (req, res) => {
    const atualizado =
      await Informativo.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.json(atualizado);
  }
);

router.delete(
  "/:id",
  auth,
  async (req, res) => {
    await Informativo.findByIdAndDelete(
      req.params.id
    );

    res.json({
      msg: "Excluído"
    });
  }
);

module.exports = router;