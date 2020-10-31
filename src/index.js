const express = require("express");
const body_parser = require("body-parser");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const exphbs = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const mySqlStore = require("express-mysql-session");
const passport = require("passport");

const { database } = require("./keys");
const { dirname } = require("path");

var favicon = require("serve-favicon");

//inicializar
const app = express();
require("./lib/passport");

//settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars"),
  })
);
app.set("view engine", ".hbs");

//Middlewares
app.use(body_parser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "SianSesionMysqlNode",
    resave: false,
    saveUninitialized: false,
    store: new mySqlStore(database),
  })
);
app.use(flash());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(favicon(path.join(__dirname, "public", "img", "favicon.ico")));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});
app.use(
  multer({ storage }).fields([
    { name: "imagen_mascota" },
    { name: "historia_clinica_mascota" },
    { name: "foto_seBusca" },
    { name: "evidencia_reportes", maxCount: 4 },
    { name: "evidencia_formato" },
    { name: "carta_mascota_peligrosa" },
    { name: "vacunacion_mascota" },
    { name: "foto_usuario" },
    
  ])
);

//Variables globales
app.use((req, res, next) => {
  app.locals.success = req.flash("success");
  app.locals.message = req.flash("message");
  app.locals.user = req.user;
  next();
});
//Rutas
app.use(require("./routes"));
app.use(require("./routes/authentication"));
app.use("/mascotas", require("./routes/mascotas"));
app.use("/reportes", require("./routes/reportes"));
app.use("/busca", require("./routes/seBusca"));
app.use("/reset", require("./routes/reset"));
app.use("/upload", require("./routes/upload"));

//public
app.use(express.static(path.join(__dirname, "public")));

//Start server
app.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
  console.log("Environment: ", process.env.NODE_ENV);
});
