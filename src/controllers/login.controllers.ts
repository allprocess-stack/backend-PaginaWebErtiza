import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
    const { usuario, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT "id", "usuario", "password", "rol"
       FROM "Usuarios"
       WHERE "usuario" = $1 AND "activo" = true`,
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado o inactivo" });
        }

        const user = result.rows[0];

        // Aquí deberías usar bcrypt.compare en lugar de comparar texto plano
        // if (!(await comparePassword(password, user.Password))) {
        if (password !== user.Password) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: user.Id, rol: user.Rol },
            process.env.JWT_SECRET || "SELECT_KEY",
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                id: user.Id,
                usuario: user.Usuario,
                rol: user.Rol,
            },
        });
    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};
