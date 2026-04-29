import { Pool as PGPool } from "pg";
import mysql from "mysql2/promise";
import sqlserver from "mssql";

let dynamicPool: any = null;
let activeType: string | null = null;

export const setDynamicPool = async (config: any) => {
    // 1. Ver qué llega exactamente (Ayuda a detectar si tipobd viene vacío)
    console.log("Datos recibidos en setDynamicPool:", config);

    const { tipobd, servidor, puerto, nombrebd, usuario, contrasena } = config;

    // 2. Si tipobd es undefined o null, lanzar error claro
    if (!tipobd) {
        throw new Error("El campo 'tipobd' llegó vacío al servidor." + tipobd);

    }

    // Normalizamos: quitamos espacios y pasamos a mayúsculas
    // Ejemplo: "SQL Server" -> "SQLSERVER"
    const motor = tipobd.replace(/\s/g, "").toUpperCase();

    try {
        // Limpieza de la conexión en memoria
        if (dynamicPool) {
            console.log(`Cerrando pool previo de: ${activeType}`);
            try {
                activeType === "SQLSERVER" ? await dynamicPool.close() : await dynamicPool.end();
            } catch (closeError) {
                console.log("Aviso: No se pudo cerrar el pool anterior (ya estaba cerrado o roto)");
            }
            dynamicPool = null;
        }

        switch (motor) {
            case "POSTGRES":
            case "POSTGRESQL":
                dynamicPool = new PGPool({
                    host: servidor,
                    user: usuario,
                    password: contrasena,
                    database: nombrebd,
                    port: Number(puerto),
                    connectionTimeoutMillis: 5000
                });
                await dynamicPool.query("SELECT 1");
                break;

            case "MYSQL":
                dynamicPool = mysql.createPool({
                    host: servidor,
                    user: usuario,
                    password: contrasena,
                    database: nombrebd,
                    port: Number(puerto),
                    waitForConnections: true,
                    connectionLimit: 5 // Bajamos el límite para pruebas
                });
                await dynamicPool.query("SELECT 1");
                break;

            case "SQLSERVER": // Ahora sin espacio para mayor compatibilidad
                const sqlConfig = {
                    user: usuario,
                    password: contrasena,
                    server: servidor,
                    database: nombrebd,
                    port: Number(puerto),
                    options: {
                        encrypt: false,
                        trustServerCertificate: true
                    },
                    connectionTimeout: 5000
                };
                dynamicPool = await sqlserver.connect(sqlConfig);
                await dynamicPool.request().query("SELECT 1");
                break;

            default:
                throw new Error(`El motor '${tipobd}' no es reconocido. Usa POSTGRES, MYSQL o SQLSERVER.`);
        }

        activeType = motor;
        console.log(`Conexión establecida con ${motor}`);
        return dynamicPool;

    } catch (error: any) {
        console.error(`Error real de conexión:`, error.message);
        dynamicPool = null;
        activeType = null;
        throw error;
    }
};

export const getDynamicPool = () => dynamicPool;
export const getActiveType = () => activeType;