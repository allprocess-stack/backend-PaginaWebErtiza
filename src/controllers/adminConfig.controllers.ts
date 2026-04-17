import type { Request, Response } from 'express';
import { pool } from '../config/db';

// Guardar configuración del administrador
export const saveAdminConfig = async (req: Request, res: Response) => {
    try {
        const { Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo } = req.body;

        if (!Nombre || !Apellido || !Usuario || !Rol || !Gmail || !Password) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        await pool.query(`
            INSERT INTO Usuarios (Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo) VALUES (?, ?, ?, ?, ?, ?, ?)`, [Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo]);

    } catch (error) {
        console.error("Error al guardar la configuración del administrador:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener configuración del administrador por ID
export const getAdminConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM Usuarios WHERE Id = ?`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener todos los usuarios 
export const getAllAdminWorker = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM Usuarios`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Activar o desactivar configuración del administrador
export const activeAdminWorkerConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Activo } = req.body;

        await pool.query(
            `UPDATE Usuarios SET Activo = ? WHERE Id = ?`,
            [Activo, id]
        );

        res.json({ message: "Estado actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};