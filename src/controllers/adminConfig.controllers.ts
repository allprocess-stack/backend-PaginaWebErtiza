import type { Request, Response } from 'express';
import { executeQuery } from "../utils/dbExecutor";

// CREAR USUARIO
export const saveAdminConfig = async (req: Request, res: Response) => {
    try {
        const { Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo } = req.body;

        await executeQuery(
            `
            INSERT INTO usuarios 
            (nombre, apellido, usuario, rol, gmail, password, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo]
        );

        res.json({ success: true });
        console.log("BODY:", req.body);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

// OBTENER POR ID
export const getAdminConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await executeQuery(
            `SELECT * FROM usuarios WHERE id = ?`,
            [id]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// LISTAR TODOS
export const getAllAdminWorker = async (_req: Request, res: Response) => {
    try {
        const result = await executeQuery(
            `SELECT * FROM usuarios ORDER BY id DESC`,
            []
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// ACTIVAR / DESACTIVAR
export const activeAdminWorkerConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Activo } = req.body;

        await executeQuery(
            `UPDATE usuarios SET activo = ? WHERE id = ?`,
            [Activo, id]
        );

        res.json({ message: "Estado actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// ACTUALIZAR USUARIO
export const updateAdminConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre, Apellido, Usuario, Rol, Gmail, Password } = req.body;

        await executeQuery(
            `
            UPDATE usuarios
            SET nombre = ?, apellido = ?, usuario = ?, rol = ?, gmail = ?, password = ?
            WHERE id = ?
            `,
            [Nombre, Apellido, Usuario, Rol, Gmail, Password, id]
        );

        res.json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// ELIMINAR USUARIO
export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await executeQuery(
            `DELETE FROM usuarios WHERE id = ?`,
            [id]
        );

        res.json({ message: "Usuario eliminado" });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error interno" });
    }
};