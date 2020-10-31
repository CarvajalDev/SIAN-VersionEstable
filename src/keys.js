module.exports = {
  database: {
    host: process.env.BaseDatosConexion_URL,
    user: process.env.BaseDatosConexion_USER,
    password: process.env.BaseDatosConexion_PASS,
    database: process.env.BaseDatosConexion_DBNOMBRE,
  },
};
