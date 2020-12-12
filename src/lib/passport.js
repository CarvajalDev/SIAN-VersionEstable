const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const nodemailer = require("nodemailer");

const dbPool = require("../database");
const helpers = require("./helpers");

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      console.log(req.body);
      const rows = await dbPool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(
          password,
          user.password
        );
        if (validPassword) {
          done(null, user, req.flash("success", "Hola, " + user.nombre + ". Haz iniciado sesión en SIAN"));
        } else {
          done(null, false, req.flash("message", "Contraseña Incorrecta"));
        }
      } else {
        return done(null, false, req.flash("message", "Usuario no registrado"));
      }
    }
  )
);

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      const {
        nombre,
        apellido,
        tipo_documento,
        documento,
        telefono,
        direccion,
        municipio,
        barrio,
        comuna,
        tipo_usuario,
      } = req.body;
      const newUser = {
        email,
        password,
        nombre,
        apellido,
        documento,
        tipo_documento,
        telefono,
        direccion,
        municipio,
        barrio,
        comuna,
        tipo_usuario,
      };
      newUser.password = await helpers.encryptPassword(password);

      const result = await dbPool.query("INSERT INTO users SET ?", [newUser]);
      newUser.id = result.insertId;

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
        to: `${newUser.email}`,
        subject: "Correo de Verificación | SIAN",
        html: `<h1>Bienvenido al SISTEMA INTEGRAL DE INFORMACIÓN ANIMAL</h1>
        <p>Estás a un paso de terminar tu registro en SIAN. Solo resta verificar tu cuenta para confirmar que este es tu correo electrónico.</p>
        <br>
        <h3><a href="https://sianneiva.herokuapp.com/verificar-cuenta">Verificar Cuenta</a></h3>
        
        
        <p>Este es un mensaje automático, evite responder a este correo.</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send(500, error.message);
        } else {
          console.log("Correo enviado");
          res.status(200).jsonp(req.body);
        }
      });

      return done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await dbPool.query("SELECT * FROM users WHERE id = ?", [id]);
  done(null, rows[0]);
});
