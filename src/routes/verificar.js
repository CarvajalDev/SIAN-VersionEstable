const express = require("express");
const router = express.Router();


const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    res.render("auth/verificar-cuenta");
});


module.exports = router;
