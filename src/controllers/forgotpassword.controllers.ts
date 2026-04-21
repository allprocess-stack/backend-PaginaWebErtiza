import crypto from "crypto";
import nodemailer from "nodemailer";
import { pool } from "../config/db";
import type { Request, Response } from "express";

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        // const user = await pool.query(`
        //     SELECT * FROM "Usuarios" WHERE "gmail" = $1`, [email]);

        // if (user.rows.length === 0) {
        //     return res.status(200).json({
        //         message: "Si el correo existe, se enviaron instrucciones",
        //     });
        // }

        // const token = crypto.randomBytes(20).toString("hex");
        // const expires = new Date(Date.now() + 3600000); // 1 hora

        // await pool.query(
        //     `UPDATE "Usuarios" SET "ResetToken" = $1, "ResetTokenExpires" = $2 WHERE "Gmail" = $3`,
        //     [token, expires, email]
        // );

        // const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        // const trasporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS
        //     }
        // });

        // await trasporter.sendMail({
        //     to: email,
        //     subject: "Recuperacion de contraseña",
        //     html: `
        //     <h2>Recuperar contraseña</h2>
        //     <p>Hola, has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        //     <a href="${resetLink}" target="_blank">Restablecer contraseña</a>
        //     `
        // });

        // res.json({ message: "Correo enviado correctamente" });

    } catch (err) {
        console.error("Error en forgotpassword:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}