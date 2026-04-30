import type { Request, Response } from "express";
import { setDynamicPool, getDynamicPool } from "../utils/dbDynamic";
import { executeQuery } from "../utils/dbExecutor";
import { MASTER_USER } from "./masterUser";

// GUARDAR CONFIG
export const saveDBConfig = async (req: Request, res: Response) => {
    try {
        const {
            tipobd, servidor, puerto, nombrebd,
            usuario, contrasena, idusuario, rol, activo
        } = req.body;

        const isMasterUser =
            usuario === MASTER_USER.username &&
            contrasena === MASTER_USER.password;

        if (!isMasterUser && rol === "WORKER") {
            return res.status(403).json({ error: "No tienes permisos" });
        }

        const idFinal = isMasterUser ? null : idusuario;

        // Validar conexión dinámica
        await setDynamicPool({
            tipobd,
            usuario,
            servidor,
            nombrebd,
            contrasena,
            puerto
        });

        // Desactivar anteriores
        if (activo) {
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
                tipobd,
                servidor,
                puerto,
                nombrebd,
                usuario,
                contrasena,
                new Date(), // reemplaza NOW()
                activo,
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
            tipobd, servidor, puerto, nombrebd,
            usuario, contrasena, activo, idusuario
        } = req.body;

        const isMaster =
            usuario === MASTER_USER.username &&
            contrasena === MASTER_USER.password;

        const idFinal = isMaster ? null : idusuario;

        const result = await executeQuery(
            `
      UPDATE configuracionbd
      SET tipobd = ?, servidor = ?, puerto = ?, nombrebd = ?,
          usuario = ?, contrasena = ?, activo = ?, idusuario = ?
      WHERE id = ?
      `,
            [
                tipobd,
                servidor,
                puerto,
                nombrebd,
                usuario,
                contrasena,
                activo,
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
            `SELECT * FROM configuracionbd ORDER BY id DESC`,
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
            tipobd: config.tipobd,
            usuario: config.usuario,
            servidor: config.servidor,
            nombrebd: config.nombrebd,
            contrasena: config.contrasena,
            puerto: config.puerto
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