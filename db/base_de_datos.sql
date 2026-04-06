CREATE DATABASE "bdbalanza";
-- Creación de tablas

CREATE TABLE "Rol" (
  "Id" SERIAL PRIMARY KEY,
  "Rol" varchar(255)
);

CREATE TABLE "Usuarios" (
  "Id" SERIAL PRIMARY KEY,
  "Nombre" varchar(255),
  "Usuario" varchar(255) UNIQUE,
  "Gmail" varchar(255),
  "Password" varchar(255),
  "IdRol" int
);

CREATE TABLE "Empresas" (
  "Id" SERIAL PRIMARY KEY,
  "Tipo" varchar(255),
  "SubTipo" varchar(255),
  "Empresa" varchar(255),
  "RUC" varchar(255),
  "Direccion" varchar(255),
  "Telefono" varchar(255),
  "Contacto" varchar(255),
  "Correo" varchar(255),
  "Informacion" text,
  "FechaCreacion" timestamp,
  "IdUsuario" int
);

CREATE TABLE "Productos" (
  "Id" SERIAL PRIMARY KEY,
  "Producto" varchar(255),
  "Descripcion" text,
  "IdUsuario" int,
  "Fecha" timestamp
);

CREATE TABLE "Registros" (
  "Id" SERIAL PRIMARY KEY,
  "Guia" varchar(255),
  "Estado" varchar(255),
  "Placa" varchar(255),
  "Cliente" varchar(255),
  "Ruc" varchar(255),
  "Chofer" varchar(255),
  "IdProducto" int,
  "PesoIn" numeric(12,2),
  "PesoOut" numeric(12,2),
  "PesoNeto" numeric(12,2),
  "Modo" varchar(255),
  "Observacion" text,
  "FechaEntrada" timestamp,
  "FechaSalida" timestamp,
  "IdUsuario" int,
  "IdEmpresa" int
);

CREATE TABLE "HistorialRegistros" (
  "Id" SERIAL PRIMARY KEY,
  "Guia" varchar(255),
  "Estado" varchar(255),
  "Placa" varchar(255),
  "Cliente" varchar(255),
  "Ruc" varchar(255),
  "Chofer" varchar(255),
  "IdProducto" int,
  "PesoIn" numeric(12,2),
  "PesoOut" numeric(12,2),
  "PesoNeto" numeric(12,2),
  "Modo" varchar(255),
  "Observacion" text,
  "FechaEntrada" timestamp,
  "FechaSalida" timestamp,
  "IdUsuario" int,
  "IdEmpresa" int
);

CREATE TABLE "ConfiguracionBD" (
  "Id" SERIAL PRIMARY KEY,
  "TipoBd" varchar(255),
  "Servidor" varchar(255),
  "Puerto" varchar(255),
  "NombreBd" varchar(255),
  "Usuario" varchar(255),
  "Contrasena" varchar(255),
  "FechaCreacion" timestamp,
  "IdUsuario" int
);

CREATE TABLE "ManualGuia" (
  "Id" SERIAL PRIMARY KEY,
  "Titulo" varchar(255),
  "Descripcion" varchar(255),
  "FechaCreacion" timestamp,
  "IdUsuario" int
);

CREATE TABLE "ConfiguracionTicket" (
  "Id" SERIAL PRIMARY KEY,
  "Prefijo" varchar(255),
  "formato" varchar(255),
  "FechaCreacion" timestamp,
  "IdUsuario" int
);

CREATE TABLE "ConfiguracionTcp" (
  "Id" SERIAL PRIMARY KEY,
  "Ip" varchar(255),
  "Puerto" varchar(255),
  "IdUsuario" int
);

CREATE TABLE "ConfiguracionBalanza" (
  "Id" SERIAL PRIMARY KEY,
  "Umbral" varchar(255),
  "PesoMax" varchar(255),
  "UnidadMedida" varchar(255),
  "IdUsuario" int
);

-- Definición de llaves foráneas (Foreign Keys)

ALTER TABLE "Usuarios" ADD CONSTRAINT "fk_usuario_rol" FOREIGN KEY ("IdRol") REFERENCES "Rol" ("Id");

ALTER TABLE "Empresas" ADD CONSTRAINT "fk_empresa_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "Registros" ADD CONSTRAINT "fk_registro_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "Registros" ADD CONSTRAINT "fk_registro_empresa" FOREIGN KEY ("IdEmpresa") REFERENCES "Empresas" ("Id");

ALTER TABLE "Registros" ADD CONSTRAINT "fk_registro_producto" FOREIGN KEY ("IdProducto") REFERENCES "Productos" ("Id");

ALTER TABLE "Productos" ADD CONSTRAINT "fk_producto_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "ConfiguracionBD" ADD CONSTRAINT "fk_confbd_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "ManualGuia" ADD CONSTRAINT "fk_manual_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "ConfiguracionTicket" ADD CONSTRAINT "fk_ticket_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "ConfiguracionTcp" ADD CONSTRAINT "fk_tcp_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");

ALTER TABLE "ConfiguracionBalanza" ADD CONSTRAINT "fk_balanza_usuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id");