import type { Request, Response } from 'express';
import { pool } from '../config/db.js';
// import { comparePassword } from '../utils/passwordUtils';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    const { usuario, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT u.*, r."Rol" 
       FROM "Usuarios" u
       JOIN "Rol" r ON u."IdRol" = r."Id"
       WHERE u."Usuario" = $1`, [usuario]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const user = result.rows[0];

        if (password !== user.Password) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: user.Id, rol: user.Rol, password: user.Password },
            "SELECT_KEY",
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                id: user.Id,
                usuario: user.Usuario,
                rol: user.Rol,
                password: user.Password
            }
        });

    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};