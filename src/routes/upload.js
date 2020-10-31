const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs-extra");

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/edit/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const usuarios = await pool.query("SELECT * FROM users WHERE id = ?", [
        id,
      ]);
  res.render("pic-profile", {usuario: usuarios[0],});
});


router.post("/subida/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const {
        foto_usuario,
      } = req.body;

      const result = await cloudinary.v2.uploader.upload(
        req.files["foto_usuario"][0].path

      );
      const newPic = {
        foto_usuario: result.url,
      };

      await pool.query("UPDATE users set ? WHERE id = ?", [newPic, id]);

      
      await fs.unlink(req.files["foto_usuario"][0].path);
      req.flash("success", "Foto de perfil cambiada");
  res.redirect("/profile");
});

module.exports = router;
