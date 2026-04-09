import { Pool } from "pg"; // Asumiendo PostgreSQL por tu código

// Esta variable mantendrá la conexión activa en memoria
let dynamicPool: any = null;

export const setDynamicPool = async (config: any) => {
    dynamicPool = new Pool({
        host: config.Servidor,
        user: config.Usuario,
        password: config.Contrasena,
        database: config.NombreBd,
        port: Number(config.Puerto),
    });

    await dynamicPool.query("SELECT 1"); // test real

    return dynamicPool;
};

export const getDynamicPool = () => dynamicPool;
