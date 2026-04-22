import type { Request, Response } from 'express';
import { pool } from '../config/db';

// Guardar usuario administrador o trabajador
export const saveAdminConfig = async (req: Request, res: Response) => {
    try {
        const { Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo } = req.body;

        if (!Nombre || !Apellido || !Usuario || !Rol || !Gmail || !Password) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        await pool.query(`
            INSERT INTO Usuarios (nombre, apellido, usuario, rol, gmail, password, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`, [Nombre, Apellido, Usuario, Rol, Gmail, Password, Activo]);


        res.json({ ok: true, message: "Usuario creado correctamente" });

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
            `SELECT * FROM Usuarios WHERE id = ?`,
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

// Activar o desactivar usuario
export const activeAdminWorkerConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Activo } = req.body;

        await pool.query(
            `UPDATE Usuarios SET activo = ? WHERE id = ?`,
            [Activo, id]
        );

        res.json({ message: "Estado actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Modificar usuario
export const updateAdminConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre, Apellido, Usuario, Rol, Gmail, Password } = req.body;
        await pool.query(
            `UPDATE "Usuarios" SET nombre = $1, apellido = $2, usuario = $3, rol = $4, gmail = $5, password = $6 WHERE id = $7`,
            [Nombre, Apellido, Usuario, Rol, Gmail, Password, id]
        );

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM Usuarios WHERE id = ?", [id]);

        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};