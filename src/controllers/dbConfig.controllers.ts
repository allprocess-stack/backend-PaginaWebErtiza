import type { Request, Response } from "express";
import { pool } from "../config/db";
import { createDynamicConnection } from "../utils/dbDynamic";

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

// Guardar configuración
export const saveDBConfig = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd,
            Servidor,
            Puerto,
            NombreBd,
            Usuario,
            Contrasena,
            IdUsuario,
        } = req.body;

        await pool.query(`
      INSERT INTO "ConfiguracionBD"
      ("TipoBd","Servidor","Puerto","NombreBd","Usuario","Contrasena","FechaCreacion","IdUsuario")
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
    `, [TipoBd, Servidor, Puerto, NombreBd, Usuario, Contrasena, IdUsuario]);

        res.json({
            success: true,
            message: "Configuración guardada",
        });

    } catch (error: any) {
        console.error("ERROR GUARDANDO CONFIG:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Test conexión dinámica
export const testDynamicConnection = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM "ConfiguracionBD"
      ORDER BY "FechaCreacion" DESC
      LIMIT 1
    `);

        const config = result.rows[0];

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "No hay configuración guardada",
            });
        }

        const dynamicPool = createDynamicConnection(config);

        await dynamicPool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Conexión dinámica exitosa",
        });

    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error en conexión dinámica",
            error: error.message,
        });
    }
};