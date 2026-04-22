import type { Request, Response } from "express";
import { setDynamicPool, getDynamicPool } from "../utils/dbDynamic";
import { executeQuery } from "../utils/dbExecutor";
import { MASTER_USER } from "./masterUser";

// GUARDAR CONFIG
export const saveDBConfig = async (req: Request, res: Response) => {
    try {
        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena, IdUsuario, Rol, Activo
        } = req.body;

        const isMasterUser =
            Usuario === MASTER_USER.username &&
            Contrasena === MASTER_USER.password;

        if (!isMasterUser && Rol === "TRABAJADOR") {
            return res.status(403).json({ error: "No tienes permisos" });
        }

        const idFinal = isMasterUser ? null : IdUsuario;

        // Validar conexión dinámica
        await setDynamicPool({
            TipoBd,
            Usuario,
            Servidor,
            NombreBd,
            Contrasena,
            Puerto
        });

        // Desactivar anteriores
        if (Activo) {
            await executeQuery(`UPDATE configuracionbd SET activo = ?`, [false]);
        }

        // Insertar
        await executeQuery(
            `
      INSERT INTO configuracionbd
      (tipobd, servidor, puerto, nombrebd, usuario, contrasena, fechacreacion, activo, idusuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                TipoBd,
                Servidor,
                Puerto,
                NombreBd,
                Usuario,
                Contrasena,
                new Date(), // reemplaza NOW()
                Activo,
                idFinal
            ]
        );

        res.json({ success: true });

    } catch (error: any) {
        console.error("Error en saveDBConfig:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ACTUALIZAR
export const updateDBConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const {
            TipoBd, Servidor, Puerto, NombreBd,
            Usuario, Contrasena, Activo, IdUsuario
        } = req.body;

        const isMaster =
            Usuario === MASTER_USER.username &&
            Contrasena === MASTER_USER.password;

        const idFinal = isMaster ? null : IdUsuario;

        const result = await executeQuery(
            `
      UPDATE configuracionbd
      SET tipobd = ?, servidor = ?, puerto = ?, nombrebd = ?,
          usuario = ?, contrasena = ?, activo = ?, idusuario = ?
      WHERE id = ?
      `,
            [
                TipoBd,
                Servidor,
                Puerto,
                NombreBd,
                Usuario,
                Contrasena,
                Activo,
                idFinal,
                id
            ]
        );

        res.json({ success: true });

    } catch (error: any) {
        console.error("Error en updateDBConfig:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// OBTENER UNA
export const getDBConfig = async (_req: Request, res: Response) => {
    try {
        const result = await executeQuery(
            `SELECT * FROM configuracionbd ORDER BY activo DESC`,
            []
        );

        res.json(result.rows[0] || null);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// LISTAR TODAS
export const getAllDBConfig = async (_req: Request, res: Response) => {
    try {
        const result = await executeQuery(
            `SELECT * FROM configuracionbd ORDER BY fechacreacion DESC`,
            []
        );

        res.json(result.rows);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// ACTIVAR CONFIG
export const activateDBConfig = async (req: Request, res: Response) => {
    try {
        const { Id } = req.body;

        const result = await executeQuery(
            `SELECT * FROM configuracionbd WHERE id = ?`,
            [Id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No existe" });
        }

        const config = result.rows[0];

        // Activar conexión
        await setDynamicPool({
            TipoBd: config.tipobd,
            Usuario: config.usuario,
            Servidor: config.servidor,
            NombreBd: config.nombrebd,
            Contrasena: config.contrasena,
            Puerto: config.puerto
        });

        // Actualizar estado
        await executeQuery(`UPDATE configuracionbd SET activo = ?`, [false]);
        await executeQuery(
            `UPDATE configuracionbd SET activo = ? WHERE id = ?`,
            [true, Id]
        );

        res.json({ success: true });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// TEST CONEXIÓN
export const testDynamicConnection = async (req: Request, res: Response) => {
    try {
        await setDynamicPool(req.body);

        res.json({ success: true, message: "Conexión exitosa" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ESTADO
export const getConnectionStatus = async (_req: Request, res: Response) => {
    try {
        const pool = getDynamicPool();

        res.json({
            connected: !!pool
        });

    } catch (error: any) {
        res.status(500).json({ connected: false });
    }
};