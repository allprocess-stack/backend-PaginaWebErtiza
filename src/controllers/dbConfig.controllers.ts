import type { Request, Response } from "express";
import { pool } from "../config/db";
import { setDynamicPool, getDynamicPool } from "../utils/dbDynamic";
import { MASTER_USER } from "./masterUser";


// Guardar configuración y activar conexión
export const saveDBConfig = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena, IdUsuario, Rol
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

        try {
            // Un bloque "TRY" interno, si falla el guardado, no se caiga la conexión activa
            await pool.query(`
                INSERT INTO "ConfiguracionBD"
                ("TipoBd","Servidor","Puerto","NombreBd","Usuario","Contrasena","FechaCreacion","IdUsuario")
                VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
            `, [TipoBd, Servidor, Puerto, NombreBd, Usuario, Contrasena, idFinal]);
            res.json({
                ok: true,
                tipo: isMasterUser ? "MASTER" : "ADMIN"
            });
            console.log("Registro guardado en BD");
        } catch (dbError: any) {
            console.error("Error real al guardar:", dbError);
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener última config
export const getDBConfig = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM "ConfiguracionBD"
      ORDER BY "FechaCreacion" DESC
      LIMIT 1
    `);

        res.json(result.rows[0]);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Test conexión dinámica
export const testDynamicConnection = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena
        } = req.body;

        // Crear conexión dinámica con datos del formulario
        await setDynamicPool({
            TipoBd,
            Servidor,
            Puerto,
            NombreBd,
            Usuario,
            Contrasena
        });

        res.json({
            success: true,
            message: "Conexión exitosa",
        });

    } catch (error: any) {
        console.error("Error conexión:", error);

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
        res.status(500).json({ success: false });
    }
};