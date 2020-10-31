const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs-extra");

const nodemailer = require("nodemailer");

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

//ANIMALES EXTRAVIADOS

router.get("/add-extraviado", isLoggedIn, async (req, res) => {
  const razas = await pool.query("SELECT nombre_raza FROM razas");
  const nombreRazas = razas.map((elegir) => {
    return elegir.nombre_raza;
  });
  res.render("seBusca/add-extraviados", {
    raza: nombreRazas,
  });
});

router.post("/add-extraviado", isLoggedIn, async (req, res) => {
  const {
    nombre_seBusca,
    ubicacion_seBusca,
    edad_seBusca,
    raza_seBusca,
    caracteristica_seBusca,
    telefono_seBusca,
    recompensa_seBusca,
    foto_seBusca,
    tipo_seBusca,
  } = req.body;
  const result = await cloudinary.v2.uploader.upload(
    req.files["foto_seBusca"][0].path
  );
  const newBusqueda = {
    nombre_seBusca,
    ubicacion_seBusca,
    edad_seBusca,
    raza_seBusca,
    caracteristica_seBusca,
    telefono_seBusca,
    recompensa_seBusca,
    tipo_seBusca,
    foto_seBusca: result.url,
    user_id: req.user.id,
  };

  await pool.query("INSERT INTO busquedas set ?", [newBusqueda]);

  await fs.unlink(req.files["foto_seBusca"][0].path);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "sianneiva@gmail.com",
      pass: "sianneiva123",
    },
  });

  const mailOptions = {
    from: "sianneiva@gmail.com",
    to: "h_carvajal@outlook.es",
    subject: "Notificacion | Reportes ",
    text: `¡Hola Autoridades Judiciales! El SISTEMA INTEGRAL DE INFORMACIÓN ANIMAL -SIAN- acaba de regitrar el siguiente ${newBusqueda.tipo_seBusca}: 
      \n 
      \nNombre: ${newBusqueda.nombre_seBusca}
      \nRaza: ${newBusqueda.raza_seBusca}
      \nEdad: ${newBusqueda.edad_seBusca}
      \nLugar donde se vió ultima vez: ${newBusqueda.ubicacion_seBusca}
      \nCaracterisiticas Fisicas de la Mascota: ${newBusqueda.caracteristica_seBusca}
      \nFoto de la Mascota: ${newBusqueda.foto_seBusca}
      \n
      \n
      Este es un mensaje automático, evite responder a este correo.`,
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

  req.flash("success", "La mascota extraviada ha sido publica");
  res.redirect("/busca");
});

router.get("/", isLoggedIn, async (req, res) => {
  const seBusca = await pool.query(
    "SELECT * FROM busquedas WHERE user_id = ?",
    [req.user.id]
  );
  res.render("seBusca/list", { seBusca });
});

router.get("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM busquedas WHERE id = ?", [id]);
  req.flash("success", "Eliminada Publicacíon de Mascota ");
  res.redirect("/busca");
});

router.get("/list-extraviado", isLoggedIn, async (req, res) => {
  const extraviados = await pool.query(
    "SELECT * FROM busquedas WHERE tipo_seBusca = 'Animales Extraviados' AND user_id = ?",
    [req.user.id]
  );
  res.render("seBusca/list-extraviados", { extraviados });
});

router.get("/list-hurtado", isLoggedIn, async (req, res) => {
  const hurtados = await pool.query(
    "SELECT * FROM busquedas WHERE tipo_seBusca = 'Animales Hurtados' AND user_id = ?",
    [req.user.id]
  );
  res.render("seBusca/list-hurtados", { hurtados });
});

router.get("/list-publico", async (req, res) => {
  const buscaPublico = await pool.query("SELECT * FROM busquedas");
  res.render("seBusca/list-publico", { buscaPublico });
});

module.exports = router;
