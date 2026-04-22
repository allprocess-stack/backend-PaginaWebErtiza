import type { Request, Response } from "express";
import { pool } from "../config/db";
import { setDynamicPool, getDynamicPool } from "../utils/dbDynamic";
import { MASTER_USER } from "./masterUser";


// Guardar configuración y activar conexión
export const saveDBConfig = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena, IdUsuario, Rol, Activo
        } = req.body;

        const isMasterUser = Usuario === MASTER_USER.username && Contrasena === MASTER_USER.password;

        if (!isMasterUser && Rol === "TRABAJADOR") {
            return res.status(403).json({ error: "No tienes permisos" });
        }

        const idFinal = isMasterUser ? null : IdUsuario;

        // Intentar activar conexión (usando el nuevo setDynamicPool con switch)
        // Pasamos TODO el objeto porque ahora setDynamicPool necesita TipoBd
        await setDynamicPool({ TipoBd, Usuario, Servidor, NombreBd, Contrasena, Puerto });

        // Si la conexión dinámica funcionó, actualizamos nuestra tabla local
        if (Activo) {
            await pool.query(`UPDATE "ConfiguracionBD" SET "activo" = false WHERE "activo" = true`);
        }

        await pool.query(`
            INSERT INTO "ConfiguracionBD"
            ("tipobd","servidor","puerto","nombrebd","usuario","contrasena","fechacreacion","activo","idusuario")
            VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,$8)
        `, [TipoBd, Servidor, Puerto, NombreBd, Usuario, Contrasena, Activo, idFinal]);

        res.json({ success: true, tipo: isMasterUser ? "MASTER" : Rol });
        console.log(`Configuración guardada y conexión activada para ${TipoBd}`);
    } catch (error: any) {
        console.error("Error en saveDBConfig:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Actualizar configuración existente (sin cambiar conexión activa)
export const updateDBConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { TipoBd, Servidor, Puerto, NombreBd, Usuario, Contrasena, Activo, IdUsuario, Rol } = req.body;

        // 1. Identificar si es el Master del código
        const isMaster = Usuario === MASTER_USER.username && Contrasena === MASTER_USER.password;

        // 2. Definir qué ID de usuario se guardará en la columna "idusuario"
        // Si es Master, guardamos NULL (porque no existe en la tabla Usuarios)
        // Si no es Master, guardamos el IdUsuario que viene del frontend
        const idFinal = isMaster ? null : IdUsuario;

        const query = `
            UPDATE "ConfiguracionBD"
            SET "tipobd" = $1, 
                "servidor" = $2, 
                "puerto" = $3, 
                "nombrebd" = $4, 
                "usuario" = $5, 
                "contrasena" = $6,
                "activo" = $7,
                "idusuario" = $8
            WHERE "id" = $9
        `;

        const values = [
            TipoBd,      // $1
            Servidor,    // $2
            Puerto,      // $3
            NombreBd,    // $4
            Usuario,     // $5
            Contrasena,  // $6
            Activo,      // $7
            idFinal,     // $8 (NULL para Master, ID numérico para Admins)
            id           // $9
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "No se encontró el registro" });
        }

        res.json({ success: true });

    } catch (error: any) {
        console.error("Error detallado en updateDBConfig:", error.message);
        res.status(500).json({ success: false, message: "Error: " + error.message });
    }
};

// Obtener última config
export const getDBConfig = async (req: Request, res: Response) => {
    try {


        const result = await pool.query(`
      SELECT * FROM "ConfiguracionBD"
      ORDER BY "activo" DESC
      LIMIT 1
    `);

        res.json(result.rows[0]);

    } catch (error: any) {
        console.error("Error en getDBConfig:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las configuraciones
export const getAllDBConfig = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM "ConfiguracionBD"
            ORDER BY "fechacreacion" DESC
        `);

        res.json(result.rows);

    } catch (error: any) {
        console.error("Error en getAllDBConfig:", error);
        res.status(500).json({ error: error.message });
    }
};

// Test conexión dinámica
export const testDynamicConnection = async (req: Request, res: Response) => {
    try {
        // Recibimos todos los datos del formulario
        await setDynamicPool(req.body);

        res.json({ success: true, message: "Conexión exitosa" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verifica el estado de conexión dinámica
export const getConnectionStatus = async (req: Request, res: Response) => {
    try {
        const pool = getDynamicPool();

        const isConnected = pool !== null;

        res.json({
            connected: isConnected
        });

    } catch (error: any) {
        console.error("Error en getConnectionStatus:", error);
        res.status(500).json({
            connected: false,
            error: error.message
        });
    }
};

// Desconectar conexión dinámica
export const disconnectDB = async (req: Request, res: Response) => {
    try {
        const currentPool = getDynamicPool();
        if (currentPool) {
            // Importante: No podemos simplemente poner null, hay que cerrar el socket
            // Podrías crear una función 'closePool' en dbDynamic.ts o hacerlo aquí:
            // Pero por brevedad, llamamos a una desconexión limpia
            await setDynamicPool({ TipoBd: "NONE" }).catch(() => { });
        }
        res.json({ success: true, message: "Desconectado" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Activar configuración de conexión 
export const activateDBConfig = async (req: Request, res: Response) => {
    try {
        const { Id } = req.body;
        const result = await pool.query(`SELECT * FROM "ConfiguracionBD" WHERE "id" = $1`, [Id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "No existe" });

        const config = result.rows[0];

        // Mapeamos los nombres de la BD (minúsculas) a lo que espera setDynamicPool
        await setDynamicPool({
            TipoBd: config.tipobd,
            Usuario: config.usuario,
            Servidor: config.servidor,
            NombreBd: config.nombrebd,
            Contrasena: config.contrasena,
            Puerto: config.puerto
        });

        await pool.query(`UPDATE "ConfiguracionBD" SET "activo" = (id = $1)`, [Id]);

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};