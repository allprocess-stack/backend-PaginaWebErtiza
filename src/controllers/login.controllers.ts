import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

export const MASTER_USER = {
    username: "root",
    password: "allprocess",
    role: "MASTER",
};

export const login = async (req: Request, res: Response) => {
    const { usuario, password } = req.body;

    try {
        // VALIDAR USUARIO MASTER (ANTES DE BD)
        if (
            usuario === MASTER_USER.username &&
            password === MASTER_USER.password
        ) {
            return res.json({
                user: {
                    id: null,
                    usuario: MASTER_USER.username,
                    rol: MASTER_USER.role,
                },
            });
        }

        // LOGIN NORMAL (BD)
        const result = await pool.query(
            `SELECT "id", "usuario", "password", "rol"
       FROM "usuarios"
       WHERE "usuario" = $1 AND "activo" = true`,
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado o inactivo" });
        }

        const user = result.rows[0];

        // aquí tienes otro bug (te explico abajo)
        if (password !== user.password) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        console.log("BODY:", req.body);

        return res.json({
            user: {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
            },
        });


    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};