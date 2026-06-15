const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token =
    req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({
        msg: "Token não enviado"
      });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "segredo"
    );

    req.user = decoded;

    next();
  } catch {
    return res
      .status(401)
      .json({
        msg: "Token inválido"
      });
  }
};