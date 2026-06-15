const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User =
  require("../models/User");

const router = express.Router();

router.post(
  "/register",
  async (req, res) => {
    try {
      const {
        nome,
        email,
        senha,
        perfil
      } = req.body;

      const existe =
        await User.findOne({
          email
        });

      if (existe) {
        return res
          .status(400)
          .json({
            msg: "Email já cadastrado"
          });
      }

      const senhaHash =
        await bcrypt.hash(
          senha,
          10
        );

      const user =
        await User.create({
          nome,
          email,
          senha: senhaHash,
          perfil
        });

      res.status(201).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        senha
      } = req.body;

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res
          .status(400)
          .json({
            msg: "Usuário não encontrado"
          });
      }

      const valida =
        await bcrypt.compare(
          senha,
          user.senha
        );

      if (!valida) {
        return res
          .status(400)
          .json({
            msg: "Senha incorreta"
          });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            perfil: user.perfil
          },
          process.env.JWT_SECRET ||
            "segredo",
          {
            expiresIn: "1d"
          }
        );

      res.json({
        token,
        usuario: {
          id: user._id,
          nome: user.nome,
          perfil: user.perfil
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

module.exports = router;