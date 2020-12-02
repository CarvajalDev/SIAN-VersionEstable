const { json } = require("express");
const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");

const passport = require("passport");
const crypto = require("crypto");

const pool = require("../database");

const { isLoggedIn, isNotLoggedIn } = require("../lib/auth");

router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("auth/signup");
});

router.post(
  "/signup",
  isNotLoggedIn,
  passport.authenticate("local.signup", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true,
  })
);

router.get("/signin", isNotLoggedIn, (req, res) => {
  res.render("auth/signin");
});

router.post("/signin", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local.signin", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
    failureFlash: true,
  })(req, res, next);
});

router.get("/profile", isLoggedIn, async (req, res) => {
  res.render("profile");
});

router.get("/edit-profile/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const usuarios = await pool.query("SELECT * FROM users WHERE id = ?", [
    id,
  ]);
  res.render("edit-profile", {usuario: usuarios[0]});
});

router.post("/edit-profile/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    telefono,
    email,
    tipo_documento,
    documento,
    municipio,
    direccion,
    barrio,
    comuna,
    tipo_usuario,
  } = req.body;

  const newUsuario = {
    nombre,
    apellido,
    telefono,
    email,
    tipo_documento,
    documento,
    municipio,
    direccion,
    barrio,
    comuna,
    tipo_usuario,
   };

   await pool.query("UPDATE users set ? WHERE id = ?", [newUsuario, id]);

   req.flash("success", "Datos actualizados correctamente");
   res.redirect("/profile");

});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logOut();
  res.redirect("/signin");
});

router.get("/forgot", function (req, res) {
  res.render("auth/forgot");
});

//RECUPERAR CONTRASEÑA

router.post("/forgot", async (req, res) => {
  const { newEmail } = req.body;

  const emailDB = await pool.query("SELECT * FROM users WHERE email = ?", [
    newEmail,
  ]);

  function random() {
    return Math.random().toString(36).substr(2); // Eliminar `0.`
  }

  const miToken = function token() {
    return random() + random(); // Para hacer el token más largo
  };

  const expire = new Date(Date.now() + 3600000);

  const recuperar = {
    resetToken: miToken(),
    expireToken: expire,
  };

  if (emailDB[0] === undefined) {
    req.flash("message", "Correo no registrado");
    res.redirect("/forgot");
  } else {
    await pool.query("UPDATE users set ? WHERE email = ?", [
      recuperar,
      newEmail,
    ]);

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: {
        user: "notificaciones@sian.asoayudame.org",
        pass: "Sian2020",
      },
    });

    const mailOptions = {
      from: "notificaciones@sian.asoayudame.org",
      to: `${newEmail}`,
      subject: "Recuperación de Contraseña | SIAN ",
      html: `<P>Tu pediste la recuperación de contraseña:</p>
        <h5>Este es el <a href="http://localhost:4000/reset/${recuperar.resetToken}">Enlace</a> para cambiar tu contraseña. Asegurate de recordarla y sobre todo que sea segura</h5>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.send(500, error.message);
      } else {
        console.log("Email sent");
        res.status(200).jsonp(req.body);
      }
    });

    res.render("auth/sendCambio");
  }

  console.log(newEmail);
  console.log(emailDB);
  console.log(miToken());
  console.log(expire);
  console.log(emailDB[0]);
});

/*router.post("/update-password", async (req, res) => {
  const { password } = req.body;
  const sendToken = req.headers;
  const sendNewPassword = {
    password,
  };
  /*await pool.query("UPDATE users set ? WHERE resetToken = ?", [
    sendNewPassword,
    sendToken,
  ]);

  console.log(sendToken);
});*/

module.exports = router;
