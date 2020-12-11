const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/contacto", (req, res) => {
  res.render("contacto");
})

router.post("/contacto", async (req, res) => {
  const {
    message,
    name,
    email,
    subject,
  } = req.body;

  const newContacto = {
    message,
    name,
    email,
    subject,
  };

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
    from: `notificaciones@sian.asoayudame.org`,
    to: "notificaciones@sian.asoayudame.org",
    subject: `Notificacion | Contactanos`,
    text: `Alguien se quiere poner en contacto con el sistema SIAN:
    \nNombre: ${newContacto.name}
    \nCorreo: ${newContacto.email}
    \nAsunto: ${newContacto.subject}  
    \nMensaje: ${newContacto.message}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send(500, error.message);
    } else {
      console.log("Correo Enviado");
      res.status(200).jsonp(req.body);
    }
  });

  req.flash("success", "Mensaje de contacto enviado");
  res.redirect("/contacto");
});

module.exports = router;
