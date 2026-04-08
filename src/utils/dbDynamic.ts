import { Pool } from "pg"; // Asumiendo PostgreSQL por tu código

// Esta variable mantendrá la conexión activa en memoria
let dynamicPool: Pool | null = null;

export const getDynamicPool = () => {
    if (!dynamicPool) {
        throw new Error("La conexión dinámica no ha sido inicializada.");
    }
    return dynamicPool;
};

export const setDynamicPool = async (config: any) => {
    // Si ya existe una conexión, la cerramos para liberar recursos
    if (dynamicPool) {
        await dynamicPool.end();
        console.log("Conexión anterior cerrada.");
    }

    // Creamos la nueva instancia
    dynamicPool = new Pool({
        user: config.Usuario,
        host: config.Servidor,
        database: config.NombreBd,
        password: config.Contrasena,
        port: parseInt(config.Puerto),
    });

    // Validamos la conexión de inmediato
    await dynamicPool.query("SELECT NOW()");
    console.log("Nueva conexión de BD global establecida.");

    return dynamicPool;
};