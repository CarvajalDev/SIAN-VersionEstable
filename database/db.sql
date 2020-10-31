CREATE DATABASE database_sian;

USE database_sian;

-- Tabla Usuarios 
CREATE TABLE users
(
    id INT(11) NOT NULL,
    username VARCHAR(16) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fullname VARCHAR(100) NOT NULL
);

ALTER TABLE users
    ADD PRIMARY KEY (id);

ALTER TABLE users
    MODIFY id INT
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE users;

-- Tabla mascotas
CREATE TABLE mascotas
(
    id INT(11) NOT NULL,
    nombre_mascota VARCHAR(150) NOT NULL,
    user_id INT(11),
    especie_id INT(11),
    raza_id INT(11),
    nacimiento_mascota DATE,
    direccion_mascota VARCHAR(150) NOT NULL,
    imagen_mascota VARCHAR(150) NOT NULL,
    estado_mascota BOOLEAN,
    crated_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) References users(id)
);
ALTER TABLE mascotas
    ADD PRIMARY KEY (id);

ALTER TABLE mascotas
    MODIFY id INT
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE mascotas;

-- Tabla Reportes
CREATE TABLE reportes
(
    id INT(11) NOT NULL,
    user_id INT(11),
    evidencia_reportes VARCHAR(150) NOT NULL,
    ubicacion_reportes VARCHAR(50) NOT NULL,
    descripcion_reportes VARCHAR(200) NOT NULL,
    Tipo_denuncia_reportes VARCHAR(30) NOT NULL,
    estato_reportes VARCHAR(6) NOT NULL,
    crated_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_reporte FOREIGN KEY (user_id) References users(id),
);

ALTER TABLE reportes
    ADD PRIMARY KEY (id);

ALTER TABLE reportes
    MODIFY id INT
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;


-- Tabla Imagenes

CREATE TABLE imagenes
(
    id INT(11) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    imageURL VARCHAR(150) NOT NULL,
    public_id VARCHAR(150) NOT NULL,
    mascota_id INT(11),
    CONSTRAINT fk_mascota FOREIGN KEY (mascota_id) References mascotas(id)
);

--Table SeBusca
CREATE TABLE busquedas
(
    id INT(11) NOT NULL,
    user_id INT(11),
    nombre_seBusca CHAR(30) NOT NULL,
    ubicacion_seBusca CHAR(50) NOT NULL,
    edad_seBusca DATE NOT NULL,
    raza_seBusca CHAR(30) NOT NULL,
    caracteristica_seBusca VARCHAR(200) NOT NULL,
    crated_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_busqueda FOREIGN KEY (user_id) References users(id),
);

ALTER TABLE busquedas
    ADD PRIMARY KEY (id);

ALTER TABLE busquedas
    MODIFY id INT
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;