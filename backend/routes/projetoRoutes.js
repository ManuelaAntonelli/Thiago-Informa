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
    const dados =
      await Projeto.find()
        .sort({
          createdAt: -1
        });

    res.json(dados);
  }
);

router.post(
  "/",
  auth,
  upload.single("imagem"),
  async (req, res) => {
    const projeto =
      await Projeto.create({
        titulo:
          req.body.titulo,

        descricao:
          req.body.descricao,

        imagem:
          req.file
            ? req.file.filename
            : null
      });

    res.json(projeto);
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