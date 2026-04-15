-- CREATE DATABASE "bdbalanza";

CREATE TABLE "Rol" (
  "Id" SERIAL PRIMARY KEY,
  "Rol" varchar(50) NOT NULL
);

CREATE TABLE "Usuarios" (
  "Id" SERIAL PRIMARY KEY,
  "Nombre" varchar(100),
  "Apellido" varchar(100),
  "Usuario" varchar(50) UNIQUE NOT NULL,
  "Gmail" varchar(255),
  "Password" varchar(255) NOT NULL,
  "Activo" boolean DEFAULT true,
  "IdRol" int REFERENCES "Rol" ("Id")
);

CREATE TABLE "Empresas" (
  "Id" SERIAL PRIMARY KEY,
  "Tipo" varchar(100),
  "SubTipo" varchar(100),
  "Empresa" varchar(255) NOT NULL,
  "RUC" varchar(20) UNIQUE,
  "Direccion" text,
  "Telefono" varchar(20),
  "Contacto" varchar(255),
  "Correo" varchar(255),
  "Informacion" text,
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "Productos" (
  "Id" SERIAL PRIMARY KEY,
  "Producto" varchar(255) NOT NULL,
  "Descripcion" text,
  "IdUsuario" int REFERENCES "Usuarios" ("Id"),
  "Fecha" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Esta tabla manejará TODO el ciclo de vida del pesaje
CREATE TABLE "Registros" (
  "Id" SERIAL PRIMARY KEY,
  "Guia" varchar(50),
  "Estado" varchar(50) DEFAULT 'Pendiente', -- Pendiente, Completado, Anulado
  "Placa" varchar(20),
  "Cliente" varchar(255),
  "Ruc" varchar(20),
  "Chofer" varchar(255),
  "IdProducto" int REFERENCES "Productos" ("Id"),
  "PesoIn" numeric(12,2),
  "PesoOut" numeric(12,2),
  "PesoNeto" numeric(12,2) GENERATED ALWAYS AS ("PesoIn" - "PesoOut") STORED, 
  "Modo" varchar(50),
  "Observacion" text,
  "FechaEntrada" timestamp,
  "FechaSalida" timestamp,
  "IdUsuario" int REFERENCES "Usuarios" ("Id"),
  "IdEmpresa" int REFERENCES "Empresas" ("Id")
);

CREATE TABLE "ConfiguracionBD" (
  "Id" SERIAL PRIMARY KEY,
  "TipoBd" varchar(50),
  "Servidor" varchar(255),
  "Puerto" int,
  "NombreBd" varchar(100),
  "Usuario" varchar(100),
  "Contrasena" varchar(255),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "ManualGuia" (
  "Id" SERIAL PRIMARY KEY,
  "Titulo" varchar(255),
  "Descripcion" text,
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "ConfiguracionTicket" (
  "Id" SERIAL PRIMARY KEY,
  "Prefijo" varchar(10),
  "Formato" varchar(50),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "ConfiguracionTcp" (
  "Id" SERIAL PRIMARY KEY,
  "Ip" varchar(50),
  "Puerto" int,
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "ConfiguracionBalanza" (
  "Id" SERIAL PRIMARY KEY,
  "Umbral" numeric(10,2),
  "PesoMax" numeric(10,2),
  "UnidadMedida" varchar(10),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "Usuarios" ("Id")
);