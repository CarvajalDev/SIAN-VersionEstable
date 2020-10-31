const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs-extra");

const dbPool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/add", isLoggedIn, async (req, res) => {
  const especies = await dbPool.query("SELECT * FROM especies");
  const razas = await dbPool.query("SELECT nombre_raza FROM razas");
  const nombreRazas = razas.map((elegir) => {
    return elegir.nombre_raza;
  });
  res.render("mascotas/add", {
    especies1: especies[0],
    especies2: especies[1],
    especies3: especies[2],
    especies4: especies[3],
    especies5: especies[4],
    especies6: especies[5],
    raza: nombreRazas,
  });
});

router.post("/add", isLoggedIn, async (req, res) => {
  const {
    imagen_mascota,
    nombre_mascota,
    padrinazgo_mascota,
    direccion_mascota,
    especie_mascota,
    otra_especie,
    raza_mascota,
    peligrosa_mascota,
    nacimiento_mascota,
    tamaño_mascota,
    microchip_mascota,
    rasgos_mascota,
    /*historia_clinica_mascota,
    carta_mascota_peligrosa,*/
  } = req.body;
  const result = await cloudinary.v2.uploader.upload(
    req.files["imagen_mascota"][0].path
  );

  
    /*const fileUpload = req.files["historia_clinica_mascota"][0].path;
    const fileUpload2 = req.files["carta_mascota_peligrosa"][0].path;*/
 

  

  const newMascota = {
    imagen_mascota: result.url,
    nombre_mascota,
    padrinazgo_mascota,
    direccion_mascota,
    especie_mascota,
    otra_especie,
    raza_mascota,
    peligrosa_mascota,
    nacimiento_mascota,
    tamaño_mascota,
    microchip_mascota,
    rasgos_mascota,
    /*historia_clinica_mascota: fileUpload,
    carta_mascota_peligrosa: fileUpload2,*/
    user_id: req.user.id,
  };

  await dbPool.query("INSERT INTO mascotas set ?", [newMascota]);

  await fs.unlink(req.files["imagen_mascota"][0].path);
  //await fs.unlink(req.files["historia_clinica_mascota"][0].path);
  //await fs.unlink(req.files["carta_mascota_peligrosa"][0].path);

  req.flash("success", "mascota guardada correctamente");
  res.redirect("/mascotas");
});

router.get("/", isLoggedIn, async (req, res) => {
  const mascotas = await dbPool.query(
    "SELECT * FROM mascotas WHERE user_id = ?",
    [req.user.id]
  );
  res.render("mascotas/list", { mascotas });
});

router.get("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await dbPool.query("DELETE FROM mascotas WHERE id = ?", [id]);
  req.flash("success", "Mascota eliminada correctamente");
  res.redirect("/mascotas");
});

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const mascotas = await dbPool.query("SELECT * FROM mascotas WHERE id = ?", [
    id,
  ]);
  const especies = await dbPool.query("SELECT * FROM especies");
  const razas = await dbPool.query("SELECT nombre_raza FROM razas");
  const nombreRazas = razas.map((elegir) => {
    return elegir.nombre_raza;
  });
  res.render("mascotas/edit", {
    mascota: mascotas[0],
    raza: nombreRazas,
    especies1: especies[0],
    especies2: especies[1],
    especies3: especies[2],
    especies4: especies[3],
    especies5: especies[4],
    especies6: especies[5],
  });
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const {
    imagen_mascota,
    nombre_mascota,
    padrinazgo_mascota,
    direccion_mascota,
    especie_mascota,
    raza_mascota,
    peligrosa_mascota,
    nacimiento_mascota,
    tamaño_mascota,
    microchip_mascota,
    rasgos_mascota,
    historia_clinica_mascota,
    carta_mascota_peligrosa,
    vacunacion_mascota,
  } = req.body;

  const result = await cloudinary.v2.uploader.upload(
    req.files["imagen_mascota"][0].path
  );
  const result2 = await cloudinary.v2.uploader.upload(
    req.files["vacunacion_mascota"][0].path
  );
  const fileUpload = req.files["historia_clinica_mascota"][0].path;
  const fileUpload2 = req.files["carta_mascota_peligrosa"][0].path;

  const newMascota = {
    imagen_mascota: result.url,
    nombre_mascota,
    padrinazgo_mascota,
    direccion_mascota,
    especie_mascota,
    raza_mascota,
    peligrosa_mascota,
    nacimiento_mascota,
    tamaño_mascota,
    microchip_mascota,
    rasgos_mascota,
    historia_clinica_mascota: fileUpload,
    carta_mascota_peligrosa: fileUpload2,
    vacunacion_mascota: result2.url,
  };
  await dbPool.query("UPDATE mascotas set ? WHERE id = ?", [newMascota, id]);

  await fs.unlink(req.files["imagen_mascota"][0].path);
  await fs.unlink(req.files["historia_clinica_mascota"][0].path);
  await fs.unlink(req.files["carta_mascota_peligrosa"][0].path);
  await fs.unlink(req.files["vacunacion_mascota"][0].path);

  req.flash("success", "Mascota editada correctamente");
  res.redirect("/mascotas");
});

router.get("/padrinazgo-individual", isLoggedIn, async (req, res) => {
  const mascotaIndividual = await dbPool.query(
    "SELECT * FROM mascotas WHERE padrinazgo_mascota = 'Padrinazgo individual' AND user_id = ?",
    [req.user.id]
  );
  res.render("mascotas/list-individual", { mascotaIndividual });
});

router.get("/padrinazgo-comunitario", isLoggedIn, async (req, res) => {
  const mascotaComunitaria = await dbPool.query(
    "SELECT * FROM mascotas WHERE padrinazgo_mascota = 'Padrinazgo comunitario' AND user_id = ?",
    [req.user.id]
  );
  res.render("mascotas/list-comunitario", { mascotaComunitaria });
});

router.get("/razas-peligrosas", isLoggedIn, async (req, res) => {
  const razasPeligrosas = await dbPool.query(
    "SELECT * FROM mascotas WHERE peligrosa_mascota = 'si' AND user_id = ?",
    [req.user.id]
  );
  res.render("mascotas/list-peligrosas", { razasPeligrosas });
});

module.exports = router;
