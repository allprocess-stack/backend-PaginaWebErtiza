import { Pool } from "pg";

export const createDynamicConnection = (config: any) => {
    return new Pool({
        user: config.Usuario,
        host: config.Servidor,
        database: config.NombreBd,
        password: config.Contrasena,
        port: Number(config.Puerto),
    });
};