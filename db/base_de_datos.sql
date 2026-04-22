-- CREATE DATABASE "bdbalanza";

CREATE TABLE "usuarios" (
  "Id" SERIAL PRIMARY KEY,
  "Nombre" varchar(100),
  "Apellido" varchar(100),
  "Usuario" varchar(50) UNIQUE NOT NULL,
  "Rol" Varchar(50) ,
  "Gmail" varchar(255),
  "Password" varchar(255) NOT NULL,
  "Activo" boolean DEFAULT true,
);

CREATE TABLE "empresas" (
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

CREATE TABLE "productos" (
  "Id" SERIAL PRIMARY KEY,
  "Producto" varchar(255) NOT NULL,
  "Descripcion" text,
  "IdUsuario" int REFERENCES "usuarios" ("Id"),
  "Fecha" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Esta tabla manejará TODO el ciclo de vida del pesaje
CREATE TABLE "registros" (
  "Id" SERIAL PRIMARY KEY,
  "Guia" varchar(50),
  "Estado" varchar(50) DEFAULT 'Ingreso', -- Pendiente, Completado, Anulado
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
  "IdUsuario" int REFERENCES "usuarios" ("Id"),
  "IdEmpresa" int REFERENCES "empresas" ("Id")
);

CREATE TABLE "configuracionbd" (
  "Id" SERIAL PRIMARY KEY,
  "TipoBd" varchar(50),
  "Servidor" varchar(255),
  "Puerto" int,
  "NombreBd" varchar(100),
  "Usuario" varchar(100),
  "Contrasena" varchar(255),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "usuarios" ("Id")
);

CREATE TABLE "manualguia" (
  "Id" SERIAL PRIMARY KEY,
  "Titulo" varchar(255),
  "Descripcion" text,
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "IdUsuario" int REFERENCES "usuarios" ("Id")
);

CREATE TABLE "configuracionticket" (
  "Id" SERIAL PRIMARY KEY,
  "Prefijo" varchar(10),
  "Formato" varchar(50),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "usuarios" ("Id")
);

CREATE TABLE "configuraciontcp" (
  "Id" SERIAL PRIMARY KEY,
  "Ip" varchar(50),
  "Puerto" int,
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "usuarios" ("Id")
);

CREATE TABLE "configuracionbalanza" (
  "Id" SERIAL PRIMARY KEY,
  "Umbral" numeric(10,2),
  "PesoMax" numeric(10,2),
  "UnidadMedida" varchar(10),
  "FechaCreacion" timestamp DEFAULT CURRENT_TIMESTAMP,
  "Activo" boolean DEFAULT true,
  "IdUsuario" int REFERENCES "usuarios" ("Id")
);