const express = require("express");
const router = express.Router();

const pool = require("../database");
const helpers = require("../lib/helpers");

router.get("/", (req, res) => {
  res.render("auth/reset", {});
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const allTokens = await pool.query(
    "SELECT * FROM users WHERE resetToken = ?",
    [id]
  );

  console.log(allTokens[0].resetToken + " AQUI DEBERIA IR EL TOKEN");

  res.render("auth/reset", { allToken: allTokens[0].resetToken });
  //SESION EXPIRADA
  /*const tokenDB = await pool.query(
    "SELECT * FROM users WHERE resultToken = ? AND expireToken = ?",
    [id, Date.now]
  );

  if(!tokenDB){
    req.flash("message", "El tiempo del enlace Expiró");
    res.redirect("auth/reset");
  }*/
});

router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const changePassword = {
    password,
    resetToken: undefined,
    expireToken: undefined,
  };

  changePassword.password = await helpers.encryptPassword(password);

  await pool.query("UPDATE users set ? WHERE resetToken = ?", [
    changePassword,
    id,
  ]);

  req.flash("success", "contraseña cambiada correctamente");
  res.redirect("/signin");

  console.log(id + " THIS");
});

module.exports = router;
