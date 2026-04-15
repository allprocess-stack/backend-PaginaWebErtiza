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

        // Verificar si el usuario es master
        const isMasterUser =
            Usuario === MASTER_USER.username &&
            Contrasena === MASTER_USER.password;


        // Bloquea a TRABAJADOR directamente
        if (!isMasterUser && Rol === "TRABAJADOR") {
            return res.status(403).json({
                error: "No tienes permisos para guardar configuración"
            });
        }
        const idFinal = isMasterUser ? null : IdUsuario;

        // ACTIVAR CONEXIÓN (Siempre lo primero)
        await setDynamicPool({ Usuario, Servidor, NombreBd, Contrasena, Puerto });
        // Desactivar config anterior
        if (Activo) {
            await pool.query(`
                UPDATE "ConfiguracionBD"
                SET "Activo" = false
                WHERE "Activo" = true
            `);
        }
        try {
            // Un bloque "TRY" interno, si falla el guardado, no se caiga la conexión activa
            await pool.query(`
                INSERT INTO "ConfiguracionBD"
                ("TipoBd","Servidor","Puerto","NombreBd","Usuario","Contrasena","FechaCreacion","Activo","IdUsuario")
                VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,$8)
            `, [TipoBd, Servidor, Puerto, NombreBd, Usuario, Contrasena, Activo, idFinal]);
            res.json({
                ok: true,
                tipo: isMasterUser ? "MASTER" : "ADMIN"
            });
            console.log("Registro guardado en BD");
        } catch (dbError: any) {
            console.error("Error real al guardar:", dbError);

            return res.status(500).json({
                success: false,
                message: "Error al guardar configuración",
                detail: dbError.message
            });
        }
    } catch (error: any) {
        console.error("Error en saveDBConfig:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener última config
export const getDBConfig = async (req: Request, res: Response) => {
    try {


        const result = await pool.query(`
      SELECT * FROM "ConfiguracionBD"
      ORDER BY "Activo" DESC
      LIMIT 1
    `);

        res.json(result.rows[0]);

    } catch (error: any) {
        console.error("Error en getDBConfig:", error);
        res.status(500).json({ error: error.message });
    }
};

// Test conexión dinámica
export const testDynamicConnection = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena, Activo
        } = req.body;

        // Crear conexión dinámica con datos del formulario
        await setDynamicPool({
            TipoBd,
            Servidor,
            Puerto,
            NombreBd,
            Usuario,
            Contrasena,
            Activo
        });

        res.json({
            success: true,
            message: "Conexión exitosa",
        });

    } catch (error: any) {
        console.error("Error en testDynamicConnection:", error);

        res.status(500).json({
            success: false,
            message: "Error en conexión",
            error: error.message,
        });
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
        const pool = getDynamicPool();

        if (pool) {
            await pool.end();
        }

        // IMPORTANTE: limpiar variable global
        (global as any).dynamicPool = null;

        res.json({ success: true });

    } catch (error) {
        console.error("Error en disconnectDB:", error);
        res.status(500).json({ success: false });
    }
};

// export const activeDBConfig = async (req: Request, res: Response) => {
//     try {
//         const { Id } = req.body;
//         if (!Id) {
//             return res.status(400).json({ error: "Id requerido" });
//         }
//         // Obtener configuración a activar
//         const result = await pool.query(`
//             SELECT * FROM "ConfiguracionBD"
//             WHERE "Id" = $1
//         `, [Id]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: "Configuración no encontrada" });
//         }
//         const configToActivate = result.rows[0];

//         // Verificar si el usuario es master
//         const isMasterUser =
//             configToActivate.Usuario === MASTER_USER.username &&
//             configToActivate.Contrasena === MASTER_USER.password;
//         // Bloquea a TRABAJADOR directamente
//         if (!isMasterUser && configToActivate.Rol === "TRABAJADOR") {
//             return res.status(403).json({
//                 error: "No tienes permisos para activar esta configuración"
//             });
//         }
//         // Activar conexión con la configuración seleccionada
//         await setDynamicPool({
//             Usuario: configToActivate.Usuario,
//             Servidor: configToActivate.Servidor,
//             NombreBd: configToActivate.NombreBd,
//             Contrasena: configToActivate.Contrasena,
//             Puerto: configToActivate.Puerto
//         });
//         // Desactivar config anterior
//         await pool.query(`
//             UPDATE "ConfiguracionBD"
//             SET "Activo" = false
//             WHERE "Activo" = true
//         `);
//         // Activar la nueva config
//         await pool.query(`
//             UPDATE "ConfiguracionBD"
//             SET "Activo" = true
//             WHERE "Id" = $1
//         `, [Id]);
//         res.json({ success: true });

//     }
//     catch (error) {
//         console.error("Error en activeDBConfig:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// };